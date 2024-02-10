const mongoose = require('mongoose');

var totalDataSchema = new mongoose.Schema({
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
  moneyAmount: {
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
      ref: "DailyRevenue"
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model("TotalData", totalDataSchema)
