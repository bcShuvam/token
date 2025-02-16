const express = require("express");
const router = express.Router();
const {
  getReferralById,
  createReferral,
} = require("../controller/referralController");

router.route("/").get(getReferralById).post(createReferral);

module.exports = router;
