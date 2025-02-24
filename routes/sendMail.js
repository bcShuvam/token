const express = require("express");
const router = express.Router();
const sendMail = require("../controller/sendMailController");

router.route("/").get(sendMail);

module.exports = router;
