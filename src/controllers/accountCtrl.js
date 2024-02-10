const Santri = require('../models/santriModel')
const Vendor = require('../models/vendorModel')
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')
const { santriQuery, vendorQuery } = require('../utils/query')
const { updatedAccounts } = require('../utils/mappingArray')

const createSantriAccount = asyncHandler(async (req, res) => {
	try {
    const { fullname } = req.body;

    const existingAccount = await Santri.findOne({ fullname });
    if(!existingAccount) {
      // create a new user
      const newAccount = await Santri.create(req.body);
      res.json({ success: true, account: newAccount });
    } else {
      throw new Error("User Already Exist")
    }

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const createVendorAccount = asyncHandler(async (req, res) => {
  try {
    const { fullname } = req.body;

    const existingAccount = await Vendor.findOne({ fullname });
    if(!existingAccount) {
      // create a new user
      const newAccount = await Vendor.create(req.body);
      res.json({ success: true, account: newAccount });
    } else {
      throw new Error("User Already Exist")
    }

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getOneSantri = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const getASantri = await Santri.findById(id)
    res.json({ success: true, getASantri })
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getOneVendor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const getAVendor = await Vendor.findById(id)
    res.json({ success: true, getAVendor })
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getSantries = asyncHandler(async (req, res) => {
  try {
    const santries = await santriQuery(req.query)
    res.json({ success: true, santries });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const getVendors = asyncHandler(async (req, res) => {
  try {
    const vendors = await vendorQuery(req.query)
    res.json({ success: true, vendors });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const banSantriAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);

    const findedSantri = await Santri.findById(id)
    if(!findedSantri) {
      res.json({ success: false, message: "User not found"}).end()
    } else {
      const bannedSantri = await Santri.findByIdAndDelete(id);
      res.json({ success: true, bannedSantri, message: `User with ID: ${id} deleted` })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const updateSantriAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const findedSantri = await Santri.findById(id)
    if(!findedSantri) {
      res.json({ success: false, message: "User not found"}).end()
    } else {
      const updatedSantri = await Santri.findByIdAndUpdate(id, req.body)

      res.json({ success: true, updatedSantri })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const updateVendorAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)

    const findedAccount = await Vendor.findById(id)
    if(!findedVendor) {
      res.json({ success: false, message: "User not found"}).end()
    } else {
      const updatedVendor = await Vendor.findByIdAndUpdate(id, req.body)

      res.json({ success: true, updatedVendor })
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

module.exports = {
  createSantriAccount,
  createVendorAccount,
  getOneSantri,
  getOneVendor,
  getSantries,
  getVendors,
  banSantriAccount,
  updateSantriAccount,
  updateVendorAccount
}