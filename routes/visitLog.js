const express = require("express");
const router = express.Router();
const visitLogsById = require("../controller/visitLogController");

router.route("").get(visitLogsById);

module.exports = router;
