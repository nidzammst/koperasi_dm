const History = require('../models/historyModel');
const ShoppingHistory = require('../models/shoppingHistoryModel');
const Account = require('../models/accountModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')

const topUp = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const { action, debitAmount, note } = req.body;

    const existingAccount = await Account.findById(id);
    if(!existingAccount) {
      res.json({ success: false, message: "Account not found" })
    } else {
      const remainingBalance = debitAmount + existingAccount.balance
      const createdHistory = await History.create({
        account: id,
        action,
        debitAmount,
        remainingBalance,
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
    } else {
      const canceledAccount = await Account.findByIdAndUpdate(transaction.account._id, {
        $inc: {
          balance: -transaction.debitAmount
        }
      })

      const updatedHistory = await History.findByIdAndUpdate(id, {
        cancelled: true
      })

      res.json({ success: true, canceledAccount, updatedHistory })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAllHistory = asyncHandler(async (req, res) => {
  try {
    const histories = await History.find();
    res.json({ success: true, histories})
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

const withdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const { action, kreditAmount, note } = req.body;

    const existingAccount = await Account.findById(id);
    if(!existingAccount) {
      res.json({ success: false, message: "Account not found" })
    } else {
      const remainingBalance = existingAccount.balance - kreditAmount
      const createdHistory = await History.create({
        account: id,
        action,
        kreditAmount,
        note,
        remainingBalance
        // admin
      })
      const kreditAccount = await Account.findByIdAndUpdate(id, {
        $inc: {
          balance: -kreditAmount
        },
        $push: {
          history: createdHistory
        }
      }, { new: true });

      res.json({ success: true, createdHistory, kreditAccount })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const cancelWithdrawal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await History.findById(id);
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else {
      const reversedAccount = await Account.findByIdAndUpdate(transaction.account._id, {
        $inc: {
          balance: kreditAmount
        }
      }, { new: true });

      const updatedHistory = await History.findByIdAndUpdate(id, {
        cancelled: true
      })
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
      const createdHistory = await History.create({
        action,
        transferAmount,
        transferringAccount,
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
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const cancelTransfer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await History.findById(id);
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not found` })
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
        cancelled: true
      })
      res.json({ success: true, reversedTransferringAccount, reversedReceivingAccount, updatedHistory })
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

      const findedAccount = await Account.findById(account);
      if(!findedAccount) {
        res.json({ success: false, message: `Account with ID: ${account} does noe exist` })
      } else {
        const createdHistory = await ShoppingHistory.create({
          account,
          purchasedProducts,
          purchaseAmount,
          remainingBalance: findedAccount.balance - purchaseAmount
        })

        const updatedData = purchasedProducts.map((prod) => {
          // ngurangin jumlah product
          const decQuant = async(productId, quant) => {
            const quantity = await Product.findByIdAndUpdate(productId, {
              $inc: { quantity: -quant }
            })

            return quantity;
          }
          // nambah saldo vendor
          const incVendorBalance = async(vendorId, debitAmount) => {
            const vendorBalance = await Account.findByIdAndUpdate(vendorId, {
              $inc: { balance: debitAmount }
            })

            return vendorBalance;
          }
          decQuant(prod.product, prod.quantity);
          incVendorBalance(prod.product.vendor, prod.total)
        })

        const buyerAccount = await Account.findByIdAndUpdate(account, {
          $inc: {
            balance: -purchaseAmount
          },
          $push: {
            history: createdHistory
          }
        }, { new: true });

        res.json({ success: true, createdHistory, updatedData, buyerAccount })
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
        cancelled: true
      })

      res.json({ success: true, reverseBuyerAccount, updatedHistory })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

module.exports = {
  getAllHistory,
  getAccountPayment,
  getAllShoppingHistory,
  getAccountShoppingHistory,
  topUp,
  cancelTopUp,
  withdrawal,
  cancelWithdrawal,
  transfer,
  cancelTransfer,
  shopping,
  cancelShopping
}