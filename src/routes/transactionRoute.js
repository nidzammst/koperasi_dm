const express = require('express');
const router = express.Router();
const {
	getAllHistory,
	getAccountPayment,
	getAllShoppingHistory,
	getAccountShoppingHistory,
	topUp,
	withdrawal,
	transfer,
	cancelTopUp,
	cancelWithdrawal,
	cancelTransfer,
	shopping,
	cancelShopping
} = require('../controllers/transactionCtrl');

router.get('/payment', getAllHistory);
router.get('/account-payment/:id', getAccountPayment);
router.get('/', getAllShoppingHistory);
router.get('/account-shopping/:id', getAccountShoppingHistory);
router.post('/topup/:id', topUp);
router.delete('/cancel-topup/:id', cancelTopUp);
router.post('/withdrawal/:id', withdrawal);
router.delete('/cancel-withdrawal/:id', cancelWithdrawal);
router.post('/transfer', transfer);
router.delete('/cancel-transfer/:id', cancelTransfer);
router.post('/shopping', shopping);
router.delete('/cancel-shopping/:id', cancelShopping);

module.exports = router;