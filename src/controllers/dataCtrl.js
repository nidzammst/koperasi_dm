const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId')
const DailyData = require('../models/dailyDataModel');
const MontlyData = require('../models/montlyDataModel');
const YearlyData = require('../models/yearlyDataModel');
const TotalData = require('../models/totalDataModel');
const { dailyDataQuery, montlyDataQuery, yearlyDataQuery } = require('../utils/dataQuery')

const getAllData = asyncHandler(async (req, res) => {
  try {
    const dailyData = await DailyData.findOne({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) });
    const montlyData = await MontlyData.findOne({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) });
    const yearlyData = await YearlyData.findOne({ date: new Date().toLocaleDateString('en-US', { year: 'numeric' }) });
    const totalData = await TotalData.findOne();
    const weeklyProfit = await DailyData.find().sort({ createdAt: -1 }).limit(7);
    const montlyProfit = await MontlyData.find().sort({ createdAt: -1 }).limit(8);
    const yearlyProfit = await YearlyData.find().sort({ createdAt: -1 }).limit(4);
    res.json({ success: true, dailyData, montlyData, yearlyData, totalData, weeklyProfit, montlyProfit, yearlyProfit });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

const deleteAllData = asyncHandler(async (req, res) => {
  try {
    const dailyData = await DailyData.deleteMany();
    const montlyData = await MontlyData.deleteMany();
    const yearlyData = await YearlyData.deleteMany();
    const totalData = await TotalData.deleteMany();
    res.json({ success: true, dailyData, montlyData, yearlyData, totalData });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

module.exports = {
  getAllData,
  deleteAllData,
}