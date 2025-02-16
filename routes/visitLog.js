const express = require("express");
const router = express.Router();
const {
  visitLogsList,
  visitLogsById,
} = require("../controller/visitLogController");

router.route("/users").get(visitLogsList);
router.route("").get(visitLogsById);

module.exports = router;
