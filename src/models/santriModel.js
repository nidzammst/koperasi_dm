const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

var santriSchema = new mongoose.Schema({
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
	telp: {
		type: String,
	},
	isMale: {
		type: Boolean,
		required: true,
		default: true
	},
	photo: {
		type: String,
		required: true,
		default: "sementara.png"
	},
	ttl: {
		type: String,
	},
	paymentId: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Payment"
	}],
	purchaseId: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Purchase"
	}],
	barcode: {
		type: String, // menyimpan data barcode dalam bentuk base64
		default: null
	},
	balance: { // total saldo
		type: Number,
		required: true,
		default: 0
	},
	banned: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true,
});

santriSchema.pre('save', async function(next) {
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

module.exports = mongoose.model("Santri", santriSchema)