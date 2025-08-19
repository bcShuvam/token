const express = require('express');
const router = express.Router();
const { pocReport,pocReportCSV } = require('../controller/pocReportController');

router.route('/').get(pocReport);
router.route('/csv').get(pocReportCSV);

module.exports = router;