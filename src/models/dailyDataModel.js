const mongoose = require('mongoose');

var dailyDataSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  topupAmount: { // uang yang masuk
    type: Number,
    required: true,
    default: 0
  },
  withdrawAmount: { // uang yang keluar
    type: Number,
    required: true,
    default: 0
  },
  revenueAmount: { // uang hasil penjualan
    type: Number,
    required: true,
    default: 0
  },
  profitAmount: { // pendapatan bersih
    type: Number,
    required: true,
    default: 0
  },
  soldOut: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
        default: 0
      }
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model("DailyData", dailyDataSchema)
