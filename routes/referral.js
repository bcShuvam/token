const express = require("express");
const router = express.Router();
const {
  getReferralById,
  getReferralByDateCountryRegionAndCity,
  getReferralByDateCountryAndRegion,
  getReferralByDateAndCountry,
  createReferral,
} = require("../controller/referralController");

router.route("/").get(getReferralById).post(createReferral);
router.route("/area/country").get(getReferralByDateAndCountry);
router.route("/area/region").get(getReferralByDateCountryAndRegion);
router.route("/area/city").get(getReferralByDateCountryRegionAndCity);

module.exports = router;
