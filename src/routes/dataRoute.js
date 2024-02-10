const express = require('express');
const router = express.Router();
const {
	getAllData,
	deleteAllData,
} = require('../controllers/dataCtrl');

router.get('/', getAllData);
router.delete('/', deleteAllData);

module.exports = router;