const express = require("express");
const router = express.Router();
const {
  visitLogsList,
  visitLogsById,
  updateReferralLogStatus,
  averageVisit
} = require("../controller/visitLogController");

router.route("/users").get(visitLogsList);
router.route("/average").get(averageVisit);
router.route("").get(visitLogsById).put(updateReferralLogStatus);

module.exports = router;
