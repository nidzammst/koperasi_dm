const mongoose = require('mongoose');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

var paymentSchema = new mongoose.Schema({
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Santri"
	},
	cancelled: {
		type: Boolean,
		required: true,
		default: false
	},
	action: {
		type: String,
		required: true,
		enum: ["Vendor's Cash Withdrawal", "Santri's Cash Withdrawal", "Fund Transfer", "Top-Up"]
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
	balanceBefore: {
		type: Number
	},
	convertedProducts: [ // produk yang dikonversi ke uang
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product"
			},
			sold: {
				type: Number
			}
		}
	],
	transferAmount: { // jumlah uang yang ditransfer
		type: Number
	},
	transferringAccount: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Santri"
	},
	senderBalanceBefore: {
		type: Number
	},
	currTransferringAccountBalance: {
		type: Number
	},
	receivingAccount: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Santri"
	},
	receiverBalanceBefore: {
		type: Number
	},
	currReceivingAccountBalance: {
		type: Number
	},
	currentBalance: { // jumlah saldo yang tersisa/ saat ini
		type: Number,
		required: true,
		default: 0
	},
}, {
	timestamps: true,
});

module.exports = mongoose.model("Payment", paymentSchema)