const mongoose = require('mongoose');

var shoppingHistorySchema = new mongoose.Schema({
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	cancelled: {
		type: Boolean,
		required: true,
		default: false
	},
	purchasedProducts: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product"
			},
			quantity: {
				type: Number,
				required: true
			},
			unitPrice: {
				type: Number,
				required: true
			},
			total: {
				type: Number,
				required: true
			}
		}
	],
	purchaseAmount: { // jumlah uang yang harus dikeluarkan untuk belanja
		type: Number,
		required: true
	},
	remainingBalance: { // jumlah saldo yang tersisa
		type: Number,
		required: true,
		default: 0
	},
}, {
	timestamps: true,
});

module.exports = mongoose.model("ShoppingHistory", shoppingHistorySchema)