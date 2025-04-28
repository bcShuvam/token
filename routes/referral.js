const express = require("express");
const router = express.Router();
const {
  getReferralById,
  getReferralByDateCountryRegionAndCity,
  getReferralByDateCountryAndRegion,
  getReferralByDateAndCountry,
  createReferral,
  exportCSVData,
  downloadReferralByDateAndCountryCSV
} = require("../controller/referralController");

router.route("/").get(getReferralById).post(createReferral);
router.route("/date").get(getReferralById).post(createReferral);
router.route("/area/country").get(getReferralByDateAndCountry);
router.route("/area/region").get(getReferralByDateCountryAndRegion);
router.route("/area/city").get(getReferralByDateCountryRegionAndCity);
router.route("/area/export").get(exportCSVData);
router.route("/area/country/download").get(downloadReferralByDateAndCountryCSV);

module.exports = router;
