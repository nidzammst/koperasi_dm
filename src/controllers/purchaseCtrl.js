const Purchase = require('../models/purchaseModel');
const Santri = require('../models/santriModel');
const Vendor = require('../models/vendorModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')
const { updateData } = require('../utils/mappingArray')
const { calculateData } = require('../utils/purchaseData')
const { printPurchaseHistory } = require('../utils/print')

const purchase = asyncHandler(async (req, res) => {
  try {
    const { account, purchasedProducts } = req.body;

    const existingAccount = await Santri.findById(account);

    const existingProduct = await Promise.all(purchasedProducts.map(async (prod) => {
      try {
        const product = await Product.findById(prod.product)
          .populate('vendor', 'balance')
        if(!product) {
          res.json({ success: false, message: `Product with ID: ${prod.product} does not exist` })
        } else if(product.quantity < prod.quantity) {
          res.json({ success: false, message: `Insufficient quantity` })
        } else {          
          // nambah saldo seller
          const sellerAccount = await Vendor.findByIdAndUpdate(product.vendor, {
            $inc: {
              balance: product.vendorPrice * prod.quantity
            }
          }, { new: true });
          return { product, quantity: prod.quantity, unitPrice: product.price, total: prod.quantity * product.price };
        }
      } catch (error) {
        throw new Error(error)
      }
    }))
    .then(data => data)
    .catch(error => console.error(`Error: ${error.message}`));
    
    if(!existingAccount) {
      res.json({ success: false, message: `Account with ID: ${account} does noe exist` })
    } else if(!existingProduct) {
      res.json({ success: false, message: `Product does not exist` })
    } else {
      const purchaseAmount = existingProduct.reduce((acc, curr) => {
        return acc + curr.total;
      }, 0)
      if(existingAccount.balance < purchaseAmount) {
        res.status(500).json({ success: false, message: `Insufficient balance` })
      } 

      const createdHistory = await Purchase.create({
        account,
        purchasedProducts: existingProduct,
        purchaseAmount,
        remainingBalance: existingAccount.balance - purchaseAmount,
        balanceBefore: existingAccount.balance
      })

      const updatedData = await updateData(existingProduct)
        .then(data => data)
        .catch(error => console.error(`Error: ${error.message}`));

      // ngurangin saldo pembeli
      const buyerAccount = await Santri.findByIdAndUpdate(account, {
        $inc: {
          balance: -purchaseAmount
        },
        $push: {
          purchaseId: createdHistory
        }
      }, { new: true });

      const data = calculateData(createdHistory);
      
      res.json({ success: true, createdHistory, buyerAccount, data })
    }

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const cancelPurchase = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Purchase.findById(id)
    if(!transaction) {
      res.json({ success: false, message: `Transaction with ID: ${id} does not found` })
    } else if(transaction.cancelled === true) {
      res.json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else {
      const existingProduct = await Promise.all(transaction.purchasedProducts.map(async (prod) => {
        try {
          const product = await Product.findByIdAndUpdate(prod.product, {
            $inc: {
              quantity: prod.quantity
            }
          })
          if(!product) {
            res.json({ success: false, message: `Product with ID: ${prod.product} does not exist` })
          } else {
            const decVendorBalance = await Vendor.findByIdAndUpdate(product.vendor, {
              $inc: {
                balance: -product.vendorPrice * prod.quantity
              }
            })
            return { product, quantity: prod.quantity, unitPrice: product.price, total: prod.quantity * product.price };
          }
        } catch (error) {
          throw new Error(error)
        }
      }))
      .then(data => data)
      .catch(error => console.error(`Error: ${error.message}`));

      const reverseBuyerAccount = await Santri.findByIdAndUpdate(transaction.account, {
        $inc: {
          balance: transaction.purchaseAmount
        }
      }, { new: true });

      const updatedHistory = await Purchase.findByIdAndUpdate(id, {
        cancelled: true,
        currentBalance: transaction.currentBalance + transaction.purchaseAmount,
        purchaseAmount: -(transaction.purchaseAmount)
      }, { new: true })

      const data = calculateData(updatedHistory)

      res.json({ success: true, reverseBuyerAccount, updatedHistory })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const printPurchase = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Purchase.findById(id)
      .populate('account', 'fullname')
      .populate('purchasedProducts.product', 'title')

    if(!transaction) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} does not exist` })
    } else if(transaction.cancelled === true) {
      res.status(500).json({ success: false, message: `Transaction with ID: ${id} has been cancelled` })
    } else  {
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

      const products = transaction.purchasedProducts.map((prod) => {
        const product = {
          item: prod.product.title,
          purchaseAmount: prod.total,
          quantity: prod.quantity,
          price: prod.unitPrice
        }
        return product;
      })
      const purchaseAmount = products.reduce((acc, curr) => {
        return acc + curr.purchaseAmount
      }, 0)
      const data = {
        nomor: `PU-${transaction._id.toString().substring(0, 12)}`,
        name: transaction.account.fullname,
        date: formattedDate,
        time: formattedTime,
        admin: 'siapa aja',
        balanceBefore: transaction.balanceBefore.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        currentBalance: transaction.remainingBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        product: products,
        purchaseAmount,
        description: transaction.note
      }
      printPurchaseHistory(data)
      res.json({ success: true, data })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const getAllPurchaseHistory = asyncHandler(async (req, res) => {
  try {
    const histories = await Purchase.find();
    res.json({ success: true, histories})
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAccountPurchaseHistory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const histories = await Purchase.find({ account: id });
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
  getAllPurchaseHistory,
  getAccountPurchaseHistory,
  purchase,
  cancelPurchase,
  printPurchase
}