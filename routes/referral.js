const express = require("express");
const router = express.Router();
const {
  getReferralById,
  getReferralByDateAndRegion,
  createReferral,
} = require("../controller/referralController");

router.route("/").get(getReferralById).post(createReferral);
router.route("/area").get(getReferralByDateAndRegion);

module.exports = router;
