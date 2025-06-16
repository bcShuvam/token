const express = require("express");
const router = express.Router();
const {
  getAttendanceById,
  postAttendanceByID,
  getAttendanceByIdAndDate,
  getAllAttendanceByDate,
  exportAttendanceToCSV,
  downloadAttendanceReport,
} = require("../controller/attendanceController");
router.route("/userId").get(getAttendanceById).post(postAttendanceByID);
router.route("/date").get(getAttendanceByIdAndDate);
router.route("/date/all").get(getAllAttendanceByDate);
router.get('/export', exportAttendanceToCSV);
router.get('/report', downloadAttendanceReport);

module.exports = router;
