const express = require('express');
const router = express.Router();
const {
	getAllPaymentHistory,
	getAccountPayment,
	topUp,
	cancelTopUp,
	printTopup,
	santriWithdrawal,
	cancelWithdrawal,
	cancelSantriWithdrawal,
	withdrawalPrint,
	vendorWithdrawal,
	cancelVendorWithdrawal,
	printVendor,
	transfer,
	cancelTransfer,
	printTransfer
} = require('../controllers/paymentCtrl');

router.get('/', getAllPaymentHistory);
router.get('/account/:id', getAccountPayment);
router.post('/topup/:id', topUp);
router.delete('/cancel-topup/:id', cancelTopUp);
router.get('/print-topup/:id', printTopup);
router.post('/withdrawal-santri/:id', santriWithdrawal);
router.delete('/cancel-santri-withdrawal/:id', cancelSantriWithdrawal);
router.get('/print-withdrawal/:id', withdrawalPrint);
router.post('/withdrawal-vendor', vendorWithdrawal);
router.delete('/cancel-vendor-withdrawal/:id', cancelVendorWithdrawal);
router.get('/print-withdrawal-vendor/:id', printVendor);
router.post('/transfer', transfer);
router.delete('/cancel-transfer/:id', cancelTransfer);
router.get('/print-transfer/:id', printTransfer);

module.exports = router;