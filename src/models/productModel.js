const mongoose = require('mongoose');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

var productSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	barcode: {
		type: String, // menyimpan data barcode dalam bentuk base64
		default: null
	},
	vendor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account"
	},
	quantity: {
		type: Number,
		required: true,
		default: 0
	},
	price: {
		type: Number,
		required: true
	},
	vendorPrice: {
		type: Number,
	},
	category: [{
		type: String
	}],
	sold: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true,
});
 productSchema.pre('save', async function(next) {
	try {
		// Membuat barcode menggunakan id akun sebagai data
	    const canvas = createCanvas();
	    JsBarcode(canvas, this._id.toString(), {
	    	format: 'CODE128',
	    	width: 1
	    });

	    // Menyimpan barcode dalam bentuk base64
	    this.barcode = canvas.toDataURL();

	    this.vendorPrice = this.price - this.price / 10

	    next();
	} catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Product", productSchema)