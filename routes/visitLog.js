const express = require("express");
const router = express.Router();
const {
  getTodaysAverageVisitOfAll,
  exportAverageVisitCSV,
  visitLogsList,
  visitLogsById,
  updateReferralLogStatus,
  averageVisit,
  getPocVisitLog,
  downloadVisitLogsById
} = require("../controller/visitLogController");

router.route("/download").get(downloadVisitLogsById);
router.route("/users").get(visitLogsList);
router.route("/all").get(getTodaysAverageVisitOfAll);
router.route('/all/export-average').get(exportAverageVisitCSV);
router.route("/average").get(averageVisit);
router.route("/average/poc").get(getPocVisitLog);
router.route("/").get(visitLogsById).put(updateReferralLogStatus);

module.exports = router;
