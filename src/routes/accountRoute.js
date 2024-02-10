const express = require('express');
const router = express.Router();
const {
  createSantriAccount,
  createVendorAccount,
  getOneSantri,
  getOneVendor,
  getSantries,
  getVendors,
  banSantriAccount,
  updateSantriAccount,
  updateVendorAccount
} = require('../controllers/accountCtrl');

router.post('/create-santri', createSantriAccount);
router.post('/create-vendor', createVendorAccount);
router.get('/santri', getSantries);
router.get('/vendor', getVendors);
router.get('/santri/:id', getOneSantri);
router.get('/vendor/:id', getOneVendor);
router.put('/ban-santri/:id', banSantriAccount);
router.put('/update-santri/:id', updateSantriAccount);
router.put('/update-vendor/:id', updateVendorAccount);

module.exports = router;