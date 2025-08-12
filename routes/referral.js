const express = require("express");
const router = express.Router();
const {
  getReferralById,
  getReferralByDateCountryRegionAndCity,
  getReferralByDateCountryAndRegion,
  getReferralByDateAndCountry,
  createPatientReferral,
  exportCSVData,
  downloadReferralByDateAndCountryCSV,
  getReferralStatsByUsers,
  updateMultipleApprovalStatuses,
  getPatientReferralsByUserId,
  getPatientReferralsByPOCOrAmb,
  updatePatientReferral,
  deletePatientReferral,
  downloadReferralStatsByUsersCSV,
  downloadCSVByUserId,
  downloadCSVByPOCOrAmb
} = require("../controller/referralController");

router.route("/").get(getReferralById)
router.route("/date").get(getReferralById);
router.route("/area/country").get(getReferralByDateAndCountry);
router.route("/area/region").get(getReferralByDateCountryAndRegion);
router.route("/area/city").get(getReferralByDateCountryRegionAndCity);
router.route("/area/export").get(exportCSVData);
router.route("/area/country/download").get(downloadReferralByDateAndCountryCSV);

router.post("/", createPatientReferral);
router.get("/referral-report/by-users", getReferralStatsByUsers);
router.get("/by-user/:id", getPatientReferralsByUserId);
router.patch("/by-user/:id", updateMultipleApprovalStatuses);
router.get("/by-poc-or-amb/:id", getPatientReferralsByPOCOrAmb);
router.put("/:id", updatePatientReferral);
router.patch("/:id", updatePatientReferral);
router.delete("/:id", deletePatientReferral);

// CSV Downloads
router.get("/referral-report/by-users/download", downloadReferralStatsByUsersCSV);
router.get("/csv/by-user/:id", downloadCSVByUserId);
router.get("/csv/by-poc-or-amb/:id", downloadCSVByPOCOrAmb);

module.exports = router;
