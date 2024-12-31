const express = require("express");
const router = express.Router();
const {
  getAttendanceById,
  postAttendanceByID,
} = require("../controller/attendanceController");

router.route("/:id").get(getAttendanceById).post(postAttendanceByID);

module.exports = router;
