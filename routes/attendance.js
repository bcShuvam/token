const express = require("express");
const router = express.Router();
const getAttendanceById = require("../controller/attendanceController");

router.route("/:id").get(getAttendanceById);

module.exports = router;
