const express = require('express');
const router = express.Router();
const {
	createProduct,
	getAllProduct,
	getAProduct,
	updateAProduct,
	deleteAProduct,
	incProdQuantity
} = require('../controllers/productCtrl');

router.post('/create', createProduct);
router.get('/products', getAllProduct);
router.get('/:id', getAProduct);
router.put('/update/:id', updateAProduct);
router.put('/inc/:id', incProdQuantity);
router.delete('/delete/:id', deleteAProduct);

module.exports = router;