const express = require('express');
const router = express.Router();
const {
	createProduct,
	getAllProduct,
	getAProduct,
	updateAProduct,
	changeBarcode,
	deleteAProduct,
	incProdQuantity,
	printInc,
	decProdQuantity,
	printDec
} = require('../controllers/productCtrl');

router.get('/', getAllProduct);
router.post('/create', createProduct);
router.get('/:id', getAProduct);
router.put('/update/:id', updateAProduct);
router.put('/barcode/:id', changeBarcode);
router.put('/inc/:id', incProdQuantity);
router.get('/print-inc/:id', printInc);
router.put('/dec/:id', decProdQuantity);
router.get('/print-dec/:id', printDec);
router.delete('/delete/:id', deleteAProduct);

module.exports = router;