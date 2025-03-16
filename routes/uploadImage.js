const express = require('express');
const { uploadMiddleware, uploadImg } = require('../controller/uploadImage');

const router = express.Router();

router.post('/upload', uploadMiddleware, uploadImg);

module.exports = router;