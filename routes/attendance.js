const express = require("express");
const router = express.Router();
const {
  getAttendanceById,
  getTodaysAttendanceById,
  deleteAttendanceById,
  postAttendanceByID,
  getAttendanceByIdAndDate,
  getAllAttendanceByDate,
  exportAttendanceToCSV,
  downloadAttendanceReport,
  downloadAttendanceReportById
} = require("../controller/attendanceController");
router.route("/userId").get(getAttendanceById).post(postAttendanceByID);
router.route("/today/:id").get(getTodaysAttendanceById);
router.route("/today/:id").delete(deleteAttendanceById);
router.route("/date").get(getAttendanceByIdAndDate);
router.route("/download").get(downloadAttendanceReportById);
router.route("/date/all").get(getAllAttendanceByDate);
router.get('/export', exportAttendanceToCSV);
router.get('/report', downloadAttendanceReport);

module.exports = router;
