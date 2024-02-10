const mongoose = require('mongoose');

var yearlyDataSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  topupAmount: {
    type: Number,
    required: true,
    default: 0
  },
  withdrawAmount: {
    type: Number,
    required: true,
    default: 0
  },
  revenueAmount: {
    type: Number,
    required: true,
    default: 0
  },
  profitAmount: {
    type: Number,
    required: true,
    default: 0
  },
  soldOut: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MontlyRevenue"
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model("YearlyData", yearlyDataSchema)
