const express = require('express');
const router = express.Router();
const {
	getAllPaymentHistory,
	getAccountPayment,
	getAllShoppingHistory,
	getAccountShoppingHistory,
	topUp,
	santriWithdrawal,
	cancelSantriWithdrawal,
	vendorWithdrawal,
	cancelVendorWithdrawal,
	transfer,
	cancelTopUp,
	cancelWithdrawal,
	cancelTransfer,
	shopping,
	cancelShopping
} = require('../controllers/transactionCtrl');

router.get('/payment', getAllPaymentHistory);
router.get('/account-payment/:id', getAccountPayment);
router.get('/', getAllShoppingHistory);
router.get('/account-shopping/:id', getAccountShoppingHistory);
router.post('/topup/:id', topUp);
router.delete('/cancel-topup/:id', cancelTopUp);
router.post('/withdrawal-santri/:id', santriWithdrawal);
router.delete('/cancel-santri-withdrawal/:id', cancelSantriWithdrawal);
router.post('/withdrawal-vendor/:id', vendorWithdrawal);
router.delete('/cancel-vendor-withdrawal/:id', cancelVendorWithdrawal);
router.post('/transfer', transfer);
router.delete('/cancel-transfer/:id', cancelTransfer);
router.post('/shopping', shopping);
router.delete('/cancel-shopping/:id', cancelShopping);

module.exports = router;