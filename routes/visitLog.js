const express = require("express");
const router = express.Router();
const {
  visitLogsList,
  visitLogsById,
  updateReferralLogStatus
} = require("../controller/visitLogController");

router.route("/users").get(visitLogsList);
router.route("").get(visitLogsById).put(updateReferralLogStatus);

module.exports = router;
