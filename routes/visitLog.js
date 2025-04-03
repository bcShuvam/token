const express = require("express");
const router = express.Router();
const {
  visitLogsList,
  visitLogsById,
  updateReferralLogStatus
} = require("../controller/visitLogController");

router.route("/users").get(visitLogsList).put(updateReferralLogStatus);
router.route("").get(visitLogsById);

module.exports = router;
