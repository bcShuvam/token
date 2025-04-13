const express = require("express");
const router = express.Router();
const {
  visitLogsList,
  visitLogsById,
  updateReferralLogStatus,
  averageVisit,
  getPocVisitLog
} = require("../controller/visitLogController");

router.route("/users").get(visitLogsList);
router.route("/average").get(averageVisit);
router.route("/average/poc").get(getPocVisitLog);
router.route("").get(visitLogsById).put(updateReferralLogStatus);

module.exports = router;
