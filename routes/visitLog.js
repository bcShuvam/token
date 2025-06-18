const express = require("express");
const router = express.Router();
const {
  visitLogsList,
  visitLogsById,
  updateReferralLogStatus,
  averageVisit,
  getPocVisitLog,
  downloadVisitLogReport
} = require("../controller/visitLogController");

router.route("/download").get(downloadVisitLogReport);
router.route("/users").get(visitLogsList);
router.route("/average").get(averageVisit);
router.route("/average/poc").get(getPocVisitLog);
router.route("").get(visitLogsById).put(updateReferralLogStatus);

module.exports = router;
