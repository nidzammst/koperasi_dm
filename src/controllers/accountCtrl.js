const Account = require('../models/accountModel')
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')

const createAccount = asyncHandler(async (req, res) => {
	try {
    const { fullname } = req.body;

    const existingAccount = await Account.findOne({ fullname });
    if(!existingAccount) {
      // create a new user
      const newAccount = await Account.create(req.body);
      res.json({ success: true, account: newAccount });
    } else {
      throw new Error("User Already Exist")
    }

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getOneAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const getAAccount = await Account.findById(id)
    res.json({ success: true, getAAccount })
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getSantriAccount = asyncHandler(async (req, res) => {
  try {
    const allSantriAccount = await Account.find({ role: "Santri" })
    res.json({ success: true, allSantriAccount });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getVendorAccount = asyncHandler(async (req, res) => {
  try {
    const allVendorAccount = await Account.find({ role: "Vendor" })
    res.json({ success: true, allVendorAccount });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getAdminAccount = asyncHandler(async (req, res) => {
  try {
    const allAdminAccount = await Account.find({ role: "Admin" })
    res.json({ success: true, allAdminAccount });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);
    const findedAccount = await Account.findById(id)
    if(!findedAccount) {
      res.json({ success: false, message: "User not found"}).end()
    } else {
      const deletedAccount = await Account.findByIdAndDelete(id);
      res.json({ success: true, deletedAccount, message: `User with ID: ${id} deleted` })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const updateAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const findedAccount = await Account.findById(id)
    if(!findedAccount) {
      res.json({ success: false, message: "User not found"}).end()
    } else {
      const updatedAccount = await Account.findByIdAndUpdate(id, req.body)

      res.json({ success: true, updatedAccount })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const changeRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const findedAccount = await Account.findById(id)
    if(!findedAccount) {
      res.json({ success: false, message: "User not found"}).end()
    } else {
      const updatedAccount = await Account.findByIdAndUpdate(id, req.body)
      res.json({ success: true, updatedAccount })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

module.exports = {
  createAccount,
  getOneAccount,
  getSantriAccount,
  getVendorAccount,
  getAdminAccount,
  deleteAccount,
  updateAccount,
  changeRole
}