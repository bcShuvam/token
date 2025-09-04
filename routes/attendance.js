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
  downloadAttendanceReportById,
} = require("../controller/attendanceController");

// Attendance routes
router.get("/userId", getAttendanceById);
router.post("/userId", postAttendanceByID);

router.get("/today/:id", getTodaysAttendanceById);
router.delete("/today/delete/:id", deleteAttendanceById);

router.get("/date", getAttendanceByIdAndDate);
router.get("/date/all", getAllAttendanceByDate);

router.get("/download", downloadAttendanceReportById);
router.get("/export", exportAttendanceToCSV);
router.get("/report", downloadAttendanceReport);

module.exports = router;
