const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

var accountSchema = new mongoose.Schema({
	fullname: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		// unique: true,
		// index: true,
		// default: ""
	},
	photo: {
		type: String,
		required: true,
		default: "sementara.png"
	},
	ttl: {
		type: String,
	},
	role: {
		type: String,
		enum: ["Santri", "Vendor", "Admin"],
		default: "Santri",
		required: true
	},
	history: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "History"
	},
	barcode: {
		type: String, // menyimpan data barcode dalam bentuk base64
		default: null
	},
	balance: { //total saldo
		type: Number,
		required: true,
		default: 0
	},
	product: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product"
	}]
}, {
	timestamps: true,
});

accountSchema.pre('save', async function(next) {
	try {
		// Membuat barcode menggunakan id akun sebagai data
	    const canvas = createCanvas();
	    JsBarcode(canvas, this._id.toString(), {
	    	format: 'CODE128',
	    	width: 1
	    });

	    // Menyimpan barcode dalam bentuk base64
	    this.barcode = canvas.toDataURL();

	    this.fullname = this.fullname.split(' ').map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1)).join(' ');

	    next();
	} catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Account", accountSchema)