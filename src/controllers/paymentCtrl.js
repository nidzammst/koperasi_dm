const Payment = require('../models/paymentModel');
const Santri = require('../models/santriModel');
const Vendor = require('../models/vendorModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')
const { getPaymentHistory } = require('../utils/query')
const { increaseMoneyData, decreaseMoneyData } = require('../utils/paymentData')
const { updateProducts, updateData, updateAccounts } = require('../utils/mappingArray')
const { printSantriWithdrawal, printTopupHistory, printVendorHistory, printTransferHistory } = require('../utils/print')

const topUp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const { action, debitAmount, note } = req.body;

    const existingAccount = await Santri.findById(id);
    if(!existingAccount || existingAccount.banned === true) {
      res.status(500).json({ success: false, message: "Account not found" })
    } else {
      const createdHistory = await Payment.create({
        account: id,
        action,
        debitAmount,
        balanceBefore: existingAccount.balance,
        currentBalance: debitAmount + existingAccount.balance,
        note
      })
      const topUpAccount = await Santri.findByIdAndUpdate(id, {
        $inc: {
          balance: debitAmount
        },
        $push: {
          paymentId: createdHistory
        }
      }, { new: true });

      const incMoneyData = await increaseMoneyData(createdHistory);

      res.json({ success: true, createdHistory, topUpAccount, incMoneyData })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const cancelTopUp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id)
    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not exist` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else if(transaction.action != "Top-Up") {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} is not topup action` })
    } else {
      const account = await Santri.findById(transaction.account._id);
      // apakah saldo cukup untuk reverse topup
      if(account.balance < transaction.debitAmount) {
        res.status(500).json({ success: false, message: `Insufficient balance` })
      } else {
        const canceledAccount = await Santri.findByIdAndUpdate(transaction.account._id, {
          $inc: {
            balance: -transaction.debitAmount
          }
        })

        const updatedHistory = await Payment.findByIdAndUpdate(id, {
          cancelled: true,
          currentBalance: transaction.currentBalance - transaction.debitAmount,
          debitAmount: -transaction.debitAmount // dibuat minus agar mengurangi total uang koperasi
        }, { new: true })

        const decMoneyData = await increaseMoneyData(updatedHistory);

        res.json({ success: true, canceledAccount, updatedHistory, decMoneyData })
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const printTopup = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id)
      .populate('account', 'fullname')
    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not exist` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else if(transaction.action === "Top-Up") {
      const time = new Date(transaction.createdAt);
      const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(time);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(time);
      const data = {
        nomor: `TU-${transaction._id.toString().substring(0, 12)}`,
        name: transaction.account.fullname,
        date: formattedDate,
        time: formattedTime,
        admin: 'siapa aja',
        debitAmount: transaction.debitAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        balanceBefore: transaction.balanceBefore.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        currentBalance: transaction.currentBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        description: transaction.note
      }
      printTopupHistory(data)
      res.json({ success: true, data })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const santriWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const { action, withdrawalAmount, note } = req.body;

    const existingAccount = await Santri.findById(id);
    if(!existingAccount) {
      res.status(500).json({ success: false, message: "Account not found" })
    } else {
      // check apakah saldo pada akun cukup
      if(existingAccount.balance < withdrawalAmount) {
        res.status(500).json({ success: false, message: `Insufficient balance` })
      } else {
        const createdHistory = await Payment.create({
          account: id,
          action,
          withdrawalAmount,
          note,
          currentBalance: existingAccount.balance - withdrawalAmount,
          balanceBefore: existingAccount.balance
          // admin
        })
        const withdrawalAccount = await Santri.findByIdAndUpdate(id, {
          $inc: {
            balance: -withdrawalAmount
          },
          $push: {
            history: createdHistory
          }
        }, { new: true });

        const decMoneyData = await decreaseMoneyData(createdHistory);

        res.json({ success: true, createdHistory, withdrawalAccount, decMoneyData })
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const cancelSantriWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id);
    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else if(transaction.action != "Santri's Cash Withdrawal") {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} is not withdrawal action` })
    } else {
      const reversedAccount = await Santri.findByIdAndUpdate(transaction.account, {
        $inc: {
          balance: transaction.withdrawalAmount
        }
      }, { new: true });

      const updatedHistory = await Payment.findByIdAndUpdate(id, {
        cancelled: true,
        currentBalance: reversedAccount.balance + transaction.withdrawalAmount,
        withdrawalAmount: -transaction.withdrawalAmount
      }, { new: true });

      const incMoneyData = await decreaseMoneyData(updatedHistory);
      res.json({ success: true, reversedAccount, updatedHistory })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const withdrawalPrint = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id).populate('account', 'balance fullname');
    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else if(transaction.cancelled = "Santri's Cash Withdrawal") {
      const time = new Date(transaction.createdAt);
      const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(time);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(time);
      const data = {
        nomor: `WD-${transaction._id.toString().substring(0, 12)}`,
        name: transaction.account.fullname,
        date: formattedDate,
        time: formattedTime,
        admin: 'siapa aja',
        withdrawalAmount: transaction.withdrawalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        balance: transaction.balanceBefore.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        currentBalance: transaction.currentBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
      }
      printSantriWithdrawal(data)
      res.json({ success: true, data })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const vendorWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);
    const { action, convertibleProducts, note } = req.body;

    const existingAccount = await Vendor.findById(id);
    if(!existingAccount) {
      res.status(500).json({ success: false, message: "Account not found" })
    } else {
      // check produk apa saja yang akan dicairkan
      const updatedProducts = await updateProducts(convertibleProducts)
        .then(updatedProducts => updatedProducts)
        .catch(error => {
          console.error(`Error: ${error.message}`);
        });

      const vendorAccount = await Vendor.findByIdAndUpdate(id, {
        $inc: {
          balance: -updatedProducts.withdrawalAmount
        }
      })

      const createdHistory = await Payment.create({
        account: id,
        action,
        withdrawalAmount: updatedProducts.withdrawalAmount,
        convertedProducts: updatedProducts.convertedProducts,
        note,
        currentBalance: existingAccount.balance - updatedProducts.withdrawalAmount
      });
      const decMoneyData = await decreaseMoneyData(createdHistory);
      res.json({ success: true, createdHistory, vendorAccount, products: updatedProducts.products, decMoneyData })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const cancelVendorWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id);
    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else if(transaction.action != "Vendor's Cash Withdrawal") {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} is not withdrawal action` })
    } else {
      const reversedAccount = await Santri.findByIdAndUpdate(transaction.account, {
        $inc: {
          balance: transaction.withdrawalAmount
        }
      }, { new: true });

      const reverseSoldQuantityProducts = transaction.convertedProducts.map(async (prod) => {
        try {
          const product = await Product.findByIdAndUpdate(prod.product._id, {
            $inc: { soldQuantity: prod.soldQuantity }
          })
          return product;
        } catch (error) {
          throw new Error(error.message);
        }
      })

      const updatedHistory = await Payment.findByIdAndUpdate(id, {
        cancelled: true,
        currentBalance: reversedAccount.balance + transaction.withdrawalAmount,
        withdrawalAmount: -transaction.withdrawalAmount
      }, { new: true });

      const incMoneyData = await decreaseMoneyData(updatedHistory);

      res.json({ success: true, reversedAccount, updatedHistory, incMoneyData })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const printVendor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id)
      .populate('account', 'fullname')
      .populate('convertedProducts.product', 'title vendorPrice price')
    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not exist` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else if(transaction.action === "Vendor's Cash Withdrawal") {
      const time = new Date(transaction.createdAt);
      const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(time);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(time);
      const products = transaction.convertedProducts.map((prod) => {
        const product = {
          item: prod.product.title,
          purchaseAmount: prod.soldQuantity * prod.product.vendorPrice,
          quantity: prod.soldQuantity,
          price: prod.product.vendorPrice
        }
        return product;
      })
      const data = {
        nomor: `WD-${transaction._id.toString().substring(0, 12)}`,
        name: transaction.account.fullname,
        date: formattedDate,
        time: formattedTime,
        admin: 'siapa aja',
        product: products,
        withdrawalAmount: transaction.withdrawalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        currentBalance: transaction.currentBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        description: transaction.note
      }
      printVendorHistory(data)
      res.json({ success: true, data })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const transfer = asyncHandler(async (req, res) => {
  try {
    const { action, transferAmount, transferringAccount, receivingAccount, note } = req.body;

    const isTransferAccountExist = await Santri.findById(transferringAccount);
    const isReceiverAccountExist = await Santri.findById(receivingAccount);
    if(!isTransferAccountExist) {
      res.status(500).json({ success: false, message: `Sender account with ID: ${transferringAccount} does not exist` })
    } else if(!isReceiverAccountExist) {
      res.status(500).json({ success: false, message: `Receiver account with ID: ${receivingAccount} does not exist` })
    } else {
      if(isTransferAccountExist.balance < transferAmount) {
        res.status(500).json({ success: false, message: `Insufficient balance` })
      } else {
        const createdHistory = await Payment.create({
          action,
          transferAmount,
          transferringAccount,
          currTransferringAccountBalance: isTransferAccountExist.balance - transferAmount,
          senderBalanceBefore: isTransferAccountExist.balance,
          receivingAccount,
          currReceivingAccountBalance: isReceiverAccountExist.balance + transferAmount,
          receiverBalanceBefore: isReceiverAccountExist.balance,
          note,
          // admin
        })

        const transferAccount = await Santri.findByIdAndUpdate(transferringAccount, {
            $inc: {
              balance: -transferAmount
            },
            $push: {
              history: createdHistory._id
            }
          }, { new: true })

        const receiverAccount = await Santri.findByIdAndUpdate(receivingAccount, {
          $inc: {
            balance: transferAmount
          },
          $push: {
            history: createdHistory._id
          }
        }, { new: true })

        res.json({ success: true, createdHistory, transferAccount, receiverAccount })
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const cancelTransfer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id).populate('receivingAccount', 'balance');
    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else {
      const accReceiver = await Santri.findById(transaction.receivingAccount);
      if(accReceiver.balance < transaction.transferAmount) {
        res.status(500).json({ success: false, message: `Insufficient balance` })
      } else {
        const reversedTransferringAccount = await Santri.findByIdAndUpdate(transaction.transferringAccount._id, {
          $inc: {
            balance: transaction.transferAmount
          }
        })
        const reversedReceivingAccount = await Santri.findByIdAndUpdate(transaction.receivingAccount._id, {
          $inc: {
            balance: -transaction.transferAmount
          }
        }, { new: true })

        const updatedHistory = await Payment.findByIdAndUpdate(id, {
          cancelled: true,
          currTransferringAccountBalance: transaction.currTransferringAccountBalance + transaction.transferAmount,
          currReceivingAccountBalance: transaction.currReceivingAccountBalance - transaction.transferAmount,
        })
        res.json({ success: true, reversedTransferringAccount, reversedReceivingAccount, updatedHistory })
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const printTransfer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Payment.findById(id)
      .populate('transferringAccount', 'fullname')
      .populate('receivingAccount', 'fullname')

    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not exist` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else if(transaction.action === "Fund Transfer") {
      const time = new Date(transaction.createdAt);
      const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(time);
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(time);
      const products = transaction.convertedProducts.map((prod) => {
        const product = {
          item: prod.product.title,
          purchaseAmount: prod.soldQuantity * prod.product.vendorPrice,
          quantity: prod.soldQuantity,
          price: prod.product.price
        }
        return product;
      })
      console.log(transaction)
      const data = {
        nomor: `TF-${transaction._id.toString().substring(0, 12)}`,
        date: formattedDate,
        time: formattedTime,
        admin: 'siapa aja',
        sender: transaction.transferringAccount.fullname,
        receiver: transaction.receivingAccount.fullname,
        transferAmount: transaction.transferAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        senderBalanceBefore: transaction.senderBalanceBefore.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        receiverBalanceBefore: transaction.receiverBalanceBefore.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        currTransferringAccountBalance: transaction.currTransferringAccountBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        currReceivingAccountBalance: transaction.currReceivingAccountBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        description: transaction.note
      }
      printTransferHistory(data)
      res.json({ success: true, data })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const getAllPaymentHistory = asyncHandler(async (req, res) => {
  try {
    const payment = await getPaymentHistory(req.query);
    res.json({ success: true, payment })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const getAccountPayment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const histories = await Payment.find({ account: id });
    if(!histories) {
      res.status(500).json({ success: false, message: `Account with ID: ${id} does not exist` })
    } else {
      res.json({ success: true, histories})
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

module.exports = {
  getAllPaymentHistory,
  getAccountPayment,
  topUp,
  cancelTopUp,
  printTopup,
  santriWithdrawal,
  cancelSantriWithdrawal,
  withdrawalPrint,
  vendorWithdrawal,
  cancelVendorWithdrawal,
  printVendor,
  transfer,
  cancelTransfer,
  printTransfer
}