const express = require('express');
const router = express.Router();
const {
	createAccount,
  getOneAccount,
  getSantriAccount,
  getVendorAccount,
  getAdminAccount,
  deleteAccount,
  updateAccount,
  changeRole
} = require('../controllers/accountCtrl');

router.post('/create', createAccount);
router.get('/account/:id', getOneAccount);
router.get('/santri', getSantriAccount);
router.get('/vendor', getVendorAccount);
router.get('/admin', getAdminAccount);
router.delete('/delete/:id', deleteAccount);
router.put('/update/:id', updateAccount);
router.put('/role/:id', changeRole);

module.exports = router;