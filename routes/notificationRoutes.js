const express = require('express');
const router = express.Router();
const { getFirebaseToken, sendNotification } = require('../controller/notificationController');

router.post('/token', getFirebaseToken);
router.post('/send', sendNotification)

module.exports = router;