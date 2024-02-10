const express = require('express');
const router = express.Router();
const {
  getAllPurchaseHistory,
  getAccountPurchaseHistory,
  purchase,
  printPurchase,
  cancelPurchase
} = require('../controllers/purchaseCtrl');

router.get('/', getAllPurchaseHistory);
router.get('/account/:id', getAccountPurchaseHistory);
router.post('/purchase', purchase);
router.get('/print/:id', printPurchase);
router.delete('/cancel/:id', cancelPurchase);

module.exports = router;