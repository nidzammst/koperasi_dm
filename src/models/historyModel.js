const mongoose = require('mongoose');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

var historySchema = new mongoose.Schema({
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	cancelled: {
		type: Boolean,
		required: true,
		default: false
	},
	action: {
		type: String,
		required: true,
		enum: ["Vendor's Cash Withdrawal"/* untuk penarikan tunai*/, "Santri's Cash Withdrawal", "Fund Transfer", "Top-Up"]
	},
	note: {
		type: String,
		required: true,
		default: "No description"
	},
	// admin: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: "Account"
	// },
	debitAmount: { // jumlah uang yang masuk melalui top-up/ produk terjual
		type: Number
	},
	withdrawalAmount: { // jumlah uang yang dicairkan
		type: Number,
	},
	transferAmount: { // jumlah uang yang ditransfer
		type: Number
	},
	transferringAccount: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	receivingAccount: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	remainingBalance: { // jumlah saldo yang tersisa
		type: Number,
		required: true,
		default: 0
	},
}, {
	timestamps: true,
});

module.exports = mongoose.model("History", historySchema)