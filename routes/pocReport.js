const express = require('express');
const router = express.Router();
const { pocReport } = require('../controller/pocReportController');

router.route('/').get(pocReport);

module.exports = router;