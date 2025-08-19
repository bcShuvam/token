const express = require('express');
const router = express.Router();
const {verifyRole} = require('../middleware/verifyRoles');
const { pocReport,pocReportCSV } = require('../controller/pocReportController');

router.get('/', verifyRole("Admin"), pocReport);
router.get('/csv', verifyRole("Admin"), pocReportCSV);

module.exports = router;