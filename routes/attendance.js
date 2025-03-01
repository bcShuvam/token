const express = require("express");
const router = express.Router();
const {
  getAttendanceById,
  postAttendanceByID,
  getAttendanceByIdAndDate,
} = require("../controller/attendanceController");
router.route("/userId").get(getAttendanceById).post(postAttendanceByID);
router.route("/date").get(getAttendanceByIdAndDate);

module.exports = router;
