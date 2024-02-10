const mongoose = require('mongoose');

var hprodSchema = new mongoose.Schema({
	vendor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Vendor"
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product"
	},
	type: {
		type: String,
		enum: ['Increase', 'Decrease']
	},
	quantity: {
		type: Number,
		required: true,
		default: 0
	},
	before: {
		type: Number,
		required: true,
		default: 0
	},
	after: {
		type: Number,
		required: true,
		default: 0
	},
	description: {
		type: String,
	},
	// admin: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: "Admin"
	// },
}, {
	timestamps: true,
});

module.exports = mongoose.model("Hprod", hprodSchema)