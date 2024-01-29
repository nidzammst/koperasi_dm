const History = require('../models/historyModel');
const ShoppingHistory = require('../models/shoppingHistoryModel');
const Account = require('../models/accountModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')
const getHistories = require('../utils/transactionQuery')

const topUp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const { action, debitAmount, note } = req.body;

    const existingAccount = await Account.findById(id);
    if(!existingAccount) {
      res.json({ success: false, message: "Account not found" })
    } else {
      const createdHistory = await History.create({
        account: id,
        action,
        debitAmount,
        currentBalance: debitAmount + existingAccount.balance,
        note
      })
      const topUpAccount = await Account.findByIdAndUpdate(id, {
        $inc: {
          balance: debitAmount
        },
        $push: {
          history: createdHistory
        }
      }, { new: true });

      res.json({ success: true, createdHistory, topUpAccount })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const cancelTopUp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await History.findById(id)
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not exist` })
    } else if(transaction.cancelled = true) {
      res.json({ success: false, message: `Transaction with ID: ${id} has already been cancelled` })
    } else {
      const account = await Account.findById(transaction.account._id);
      // apakah saldo cukup untuk reverse topup
      if(account.balance < transaction.debitAmount) {
        res.json({ success: false, message: `Insufficient balance` })
      } else {
        const canceledAccount = await Account.findByIdAndUpdate(transaction.account._id, {
          $inc: {
            balance: -transaction.debitAmount
          }
        })

        const updatedHistory = await History.findByIdAndUpdate(id, {
          cancelled: true,
          currentBalance: transaction.currentBalance - transaction.debitAmount
        })

        res.json({ success: true, canceledAccount, updatedHistory })
      }
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const santriWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const { action, withdrawalAmount, note } = req.body;

    const existingAccount = await Account.findById(id);
    if(!existingAccount) {
      res.json({ success: false, message: "Account not found" })
    } else if(existingAccount.role === "Vendor" || existingAccount.role === "Admin") {
      res.json({ success: false, message: "You cannot perform this action" })
    } else {
      // check apakah saldo pada akun cukup
      if(existingAccount.balance < withdrawalAmount) {
        res.json({ success: false, message: `Insufficient balance` })
      } else {
        const createdHistory = await History.create({
          account: id,
          action,
          withdrawalAmount,
          note,
          currentBalance: existingAccount.balance - withdrawalAmount
          // admin
        })
        const kreditedAccount = await Account.findByIdAndUpdate(id, {
          $inc: {
            balance: -withdrawalAmount
          },
          $push: {
            history: createdHistory
          }
        }, { new: true });

        res.json({ success: true, createdHistory, kreditedAccount })
      }
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const cancelSantriWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await History.findById(id);
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled = true) {
      res.json({ success: false, message: `Transaction with ID: ${id} has already been cancelled` })
    } else {
      const reversedAccount = await Account.findByIdAndUpdate(transaction.account._id, {
        $inc: {
          balance: transaction.withdrawalAmount
        }
      }, { new: true });

      const updatedHistory = await History.findByIdAndUpdate(id, {
        cancelled: true,
        currentBalance: reversedAccount.balance + transaction.withdrawalAmount
      }, { new: true });
      res.json({ success: true, reversedAccount, updatedHistory })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const vendorWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { vendorId, action, convertibleProducts, note } = req.body;

    const existingAccount = await Account.findById(id);
    if(!existingAccount) {
      res.json({ success: false, message: "Account not found" })
    } else {
      // check produk apa saja yang akan dicairkan
      const products = convertibleProducts.map(async (prod) => {
        const product = await Product.findByIdAndUpdate(prod, {
          $inc: {
            sold: 0
          }
        });
        return product;
      })

      const withdrawalAmount = products.reduce((acc, prod) => {
        return acc + prod.product.price * prod.product.sold;
      }, 0);

      const vendorAccount = await Account.findByIdAndUpdate(vendorId, {
        $inc: {
          balance: withdrawalAmount
        }
      })

      const convertedProducts = products.map((prod) => {
        const product = {
          product: prod._id,
          sold: prod.sold
        }
        return product;
      })

      const createdHistory = await History.create({
        account: vendorId,
        action,
        withdrawalAmount,
        convertedProducts,
        note,
        currentBalance: existingAccount.balance - withdrawalAmount
      });
      res.json({ success: true, createdHistory, vendorAccount })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const cancelVendorWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await History.findById(id);
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled = true) {
      res.json({ success: false, message: `Transaction with ID: ${id} has already been cancelled` })
    } else {
      const reversedAccount = await Account.findByIdAndUpdate(transaction.account._id, {
        $inc: {
          balance: transaction.withdrawalAmount
        }
      }, { new: true });

      const reverseSoldProducts = transaction.convertedProducts.map(async (prod) => {
        const product = await Product.findByIdAndUpdate(prod.product._id, {
          sold: prod.sold
        })
        return product;
      })

      const updatedHistory = await History.findByIdAndUpdate(id, {
        cancelled: true,
        currentBalance: reversedAccount.balance + transaction.withdrawalAmount
      }, { new: true });
      res.json({ success: true, reversedAccount, updatedHistory })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const transfer = asyncHandler(async (req, res) => {
  try {
    const { action, transferAmount, transferringAccount, receivingAccount, note } = req.body;

    const isTransferAccountExist = await Account.findById(transferringAccount);
    const isReceiverAccountExist = await Account.findById(receivingAccount);
    if(!isTransferAccountExist) {
      res.json({ success: false, message: `Sender account with ID: ${transferringAccount} does not exist` })
    } else if(!isReceiverAccountExist) {
      res.json({ success: false, message: `Receiver account with ID: ${receivingAccount} does not exist` })
    } else {
      if(isTransferAccountExist.balance < transferAmount) {
        res.json({ success: false, message: `Insufficient balance` })
      } else {
        const createdHistory = await History.create({
          action,
          transferAmount,
          transferringAccount,
          currTransferringAccountBalance: isTransferAccountExist.balance - transferAmount,
          currReceivingAccountBalance: isReceiverAccountExist.balance + transferAmount,
          receivingAccount,
          note,
          // admin
        })

        const transferAccount = await Account.findByIdAndUpdate(transferringAccount, {
            $inc: {
              balance: -transferAmount
            },
            $push: {
              history: createdHistory._id
            }
          }, { new: true })

        const receiverAccount = await Account.findByIdAndUpdate(receivingAccount, {
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
    res.json({ success: false, error: error.message });
  }
})

const cancelTransfer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await History.findById(id).populate('receivingAccount', 'balance');
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled = true) {
      res.json({ success: false, message: `Transaction with ID: ${id} has already been cancelled` })
    } else {
      if(receivingAccount < transaction.transferAmount) {
        res.json({ success: false, message: `Insufficient balance` })
      } else {
        const reversedTransferringAccount = await Account.findByIdAndUpdate(transaction.transferringAccount._id, {
          $inc: {
            balance: transaction.transferAmount
          }
        })
        const reversedReceivingAccount = await Account.findByIdAndUpdate(transaction.receivingAccount._id, {
          $inc: {
            balance: -transaction.transferAmount
          }
        }, { new: true })

        const updatedHistory = await History.findByIdAndUpdate(id, {
          cancelled: true,
          currTransferringAccountBalance: transaction.currTransferringAccountBalance + transaction.transferAmount,
          currReceivingAccountBalance: transaction.currReceivingAccountBalance - transaction.transferAmount
        })
        res.json({ success: true, reversedTransferringAccount, reversedReceivingAccount, updatedHistory })
      }
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const shopping = asyncHandler(async (req, res) => {
  try {
    const { account, purchasedProducts } = req.body;

    const existingAccount = await Account.findById(account);
    if(!existingAccount) {
      res.json({ success: false, message: "Account not found" })
    } else {
      const purchaseAmount = purchasedProducts.reduce((acc, curr) => {
        return acc + curr.total;
      }, 0)

      const existingAccount = await Account.findById(account);
      if(!existingAccount) {
        res.json({ success: false, message: `Account with ID: ${account} does noe exist` })
      } else {
        if(existingAccount.balance < purchaseAmount) {
          res.json({ success: false, message: `Insufficient balance` })
        } else {
          const createdHistory = await ShoppingHistory.create({
            account,
            purchasedProducts,
            purchaseAmount,
            currentBalance: existingAccount.balance - purchaseAmount
          })

          const updatedData = purchasedProducts.map((prod) => {
            // ngurangin jumlah product
            const decQuant = async(productId, quant) => {
              const quantity = await Product.findByIdAndUpdate(productId, {
                $inc: {
                  quantity: -quant,
                  sold: quant
                }
              })
            }
            // nambah saldo vendor
            const incVendorBalance = async(vendorId, debitAmount) => {
              const vendorBalance = await Account.findByIdAndUpdate(vendorId, {
                $inc: { balance: debitAmount }
              })
            }
            decQuant(prod.product, prod.quantity);
            incVendorBalance(prod.product.vendor, prod.total)
          })

          // ngurangin saldo pembeli
          const buyerAccount = await Account.findByIdAndUpdate(account, {
            $inc: {
              balance: -purchaseAmount
            },
            $push: {
              history: createdHistory
            }
          }, { new: true });

          res.json({ success: true, createdHistory, buyerAccount })
        }
      }
    }

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const cancelShopping = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await ShoppingHistory.findById(id);
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled = true) {
      res.json({ success: false, message: `Transaction with ID: ${id} has already been cancelled` })
    } else {
      const reverseUpdatedData = transaction.purchasedProducts.map((prod) => {
        // mengembalikan pengurangan jumlah product
        const incQuant = async(productId, quant) => {
          await Product.findByIdAndUpdate(productId, {
            $inc: { quantity: quant }
          })
        }
        // mengembalikan penambahan saldo vendor
        const decVendorBalance = async(vendorId, kreditAmount) => {
          await Account.findByIdAndUpdate(vendorId, {
            $inc: { balance: -kreditAmount }
          })
        }

        incQuant(prod.product, prod.quantity);
        decVendorBalance(prod.product.vendor, prod.total)
      })

      const reverseBuyerAccount = await Account.findByIdAndUpdate(transaction.account._id, {
        $inc: {
          balance: transaction.purchaseAmount
        }
      }, { new: true });

      const updatedHistory = await ShoppingHistory.findByIdAndUpdate(id, {
        cancelled: true,
        currentBalance: transaction.currentBalance + transaction.purchaseAmount
      })

      res.json({ success: true, reverseBuyerAccount, updatedHistory })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAllPaymentHistory = asyncHandler(async (req, res) => {
  try {
    const histories = await getHistories(req.query);
    res.json({ success: true, histories })
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAccountPayment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const histories = await History.find({ account: id });
    if(!histories) {
      res.json({ success: false, message: `Account with ID: ${id} does not exist` })
    } else {
      res.json({ success: true, histories})
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAllShoppingHistory = asyncHandler(async (req, res) => {
  try {
    const histories = await ShoppingHistory.find();
    res.json({ success: true, histories})
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAccountShoppingHistory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const histories = await ShoppingHistory.find({ account: id });
    if(!histories) {
      res.json({ success: false, message: `Account with ID: ${id} does not exist` })
    } else {
      res.json({ success: true, histories})
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

module.exports = {
  getAllPaymentHistory,
  getAccountPayment,
  getAllShoppingHistory,
  getAccountShoppingHistory,
  topUp,
  cancelTopUp,
  santriWithdrawal,
  cancelSantriWithdrawal,
  vendorWithdrawal,
  cancelVendorWithdrawal,
  transfer,
  cancelTransfer,
  shopping,
  cancelShopping
}