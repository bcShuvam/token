const express = require("express");
const router = express.Router();
const createReferral = require("../controller/referralController");

router.route("/").post(createReferral);

module.exports = router;
