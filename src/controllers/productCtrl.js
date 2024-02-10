const Product = require('../models/productModel')
const Vendor = require('../models/vendorModel')
const Hprod = require('../models/hprodModel')
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')
const { getProducts } = require('../utils/query')
const { printProduct } = require('../utils/print')

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { title, vendor } = req.body

    const existingProduct = await Product.findOne({ title });
    if(existingProduct) {
      res.json({ success: false, message: "Cannot create new product, product already exists" })
    } else {
      const newProduct = await Product.create(req.body);
      const updatedVendor = await Vendor.findByIdAndUpdate(vendor, {
        $push: { product: newProduct }
      })
      res.json({ success: true, newProduct })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const allProducts = await getProducts(req.query);
    res.json({ success: true, allProducts })
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const product = await Product.findById(id)
    if(!product) {
      res.json({ success: false, message: "Product not found" })
    } else {
      res.json({ success: true, product })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const updateAProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const product = await Product.findById(id) 
    if(!product) {
      res.json({ success: false, message: "Product not found" })
    } else {
      if(req.body.price) {
        req.body.vendorPrice = req.body.price - req.body.price / 10;
      }
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true })
      res.json({ success: true, updatedProduct })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const changeBarcode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const { barcodeNumber } = req.body

    const product = await Product.findById(id) 
    if(!product) {
      res.json({ success: false, message: "Product not found" })
    } else {
      try {
        const canvas = createCanvas();
        JsBarcode(canvas, barcodeNumber.toString(), {
          format: 'CODE128',
          width: 1
        });

        const barcode = canvas.toDataURL();
      } catch(err) {
        throw new Error(err)
      }
      const updatedProduct = await Product.findByIdAndUpdate(id, {
        barcode
      }, { new: true })
      res.json({ success: true, updatedProduct })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const deleteAProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const product = await Product.findById(id)
    if(!product) {
      res.json({ success: false, message: "Product not found" })
    } else {
      const deletedProduct = await Product.findByIdAndDelete(id)
      res.json({ success: true, deletedProduct })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const incProdQuantity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const { quantity, description } = req.body

    const product = await Product.findById(id)
    if(!product) {
      res.json({ success: false, message: "Product not found" })
    } else {
      const incProduct = await Product.findByIdAndUpdate(id, {
        $inc: { quantity }
      }, { new: true })
      const history = await Hprod.create({
        vendor: product.vendor,
        product: product._id,
        type: "Increase",
        quantity,
        before: product.quantity,
        after: incProduct.quantity,
        description
      })
      res.json({ success: true, incProduct, history })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const printInc = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Hprod.findById(id)
      .populate('vendor', 'fullname')
      .populate('product', 'title')

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

      const data = {
        nomor: `IN-${transaction._id.toString().substring(0, 12)}`,
        name: transaction.vendor.fullname,
        date: formattedDate,
        time: formattedTime,
        admin: 'Ibrahim Khalillah Musthafa',
        action: 'Masuk Stok',
        product: transaction.product.title,
        quantity: transaction.quantity,
        before: transaction.before,
        after: transaction.after,
        description: transaction.description
      }
      printProduct(data)
      res.json({ success: true, data })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

const decProdQuantity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const { quantity, description } = req.body

    const product = await Product.findById(id)
    if(!product) {
      res.json({ success: false, message: "Product not found" })
    } else if(product.quantity < quantity) {
      res.json({ success: false, message: "Insufficient product" })
    } else {
      const decProduct = await Product.findByIdAndUpdate(id, {
        $inc: { quantity: -quantity }
      }, { new: true })

      const history = await Hprod.create({
        vendor: product.vendor,
        product: product._id,
        type: "Decrease",
        quantity,
        before: product.quantity,
        after: decProduct.quantity,
        description
      })
      res.json({ success: true, decProduct, history })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const printDec = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const transaction = await Hprod.findById(id)
      .populate('vendor', 'fullname')
      .populate('product', 'title')

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

      const data = {
        nomor: `DC-${transaction._id.toString().substring(0, 12)}`,
        name: transaction.vendor.fullname,
        date: formattedDate,
        time: formattedTime,
        admin: 'Ibrahim Khalillah Musthafa',
        action: 'Keluar Stok',
        product: transaction.product.title,
        quantity: transaction.quantity,
        before: transaction.before,
        after: transaction.after,
        description: transaction.description
      }
      printProduct(data)
      res.json({ success: true, data })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

module.exports = {
  createProduct,
  getAllProduct,
  getAProduct,
  updateAProduct,
  changeBarcode,
  incProdQuantity,
  decProdQuantity,
  deleteAProduct,
  printInc,
  decProdQuantity,
  printDec
}