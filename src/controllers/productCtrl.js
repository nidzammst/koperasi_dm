const Product = require('../models/productModel')
const Account = require('../models/accountModel')
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { title, vendor } = req.body

    const existingProduct = await Product.findOne({ title });
    if(existingProduct) {
      res.json({ success: false, message: "Cannot create new product, product already exists" })
    } else {
      const newProduct = await Product.create(req.body);
      const updatedVendor = await Account.findByIdAndUpdate(vendor, {
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
    const allProduct = await Product.find();
    res.json({ success: true, allProduct })
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
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body)
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

    const { quantity } = req.body

    const product = await Product.findById(id)
    if(!product) {
      res.json({ success: false, message: "Product not found" })
    } else {
      const incProduct = await Product.findByIdAndUpdate(id, {
        $inc: { quantity }
      })
      res.json({ success: true, incProduct })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

module.exports = {
  createProduct,
  getAllProduct,
  getAProduct,
  updateAProduct,
  incProdQuantity,
  deleteAProduct,
}