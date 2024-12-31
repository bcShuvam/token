const Attendance = require("../model/attendance");

const getAttendanceById = async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ message: "ID is required" });
    const attendance = await Attendance.findOne({ _id: id });
    if (!attendance)
      return res.status(404).json({ message: `No user with ID ${id} found` });
    const latestAttendance = {
      _id: attendance._id,
      latestAttendance:
        attendance.attendance.length == 0
          ? []
          : attendance.attendance[attendance.attendance.length - 1],
    };
    res.status(200).json(latestAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postAttendanceByID = async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ message: "ID is required" });

    const { deviceTime, latitude, longitude } = req.body;
    if (!deviceTime || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "deviceTime, latitude, and longitude are required",
      });
    }

    const attendanceRecord = await Attendance.findById(id);
    if (!attendanceRecord) {
      return res.status(404).json({ message: `No user with ID ${id} found` });
    }

    const lastAttendance =
      attendanceRecord.attendance[attendanceRecord.attendance.length - 1];

    if (!lastAttendance || lastAttendance.status === "check-out") {
      // Add a new "check-in" entry
      attendanceRecord.attendance.push({
        status: "check-in",
        checkIn: {
          status: "check-in",
          deviceInTime: deviceTime,
          latitude: latitude,
          longitude: longitude,
        },
        checkOut: {
          status: "",
          deviceOutTime: "",
          latitude: 0,
          longitude: 0,
        },
      });
    } else if (lastAttendance.status === "check-in") {
      // Update the last "check-in" entry with "check-out" details
      const startTime = lastAttendance.createdAt;
      const endTime = Date.now();
      const startTimeStamp = new Date(startTime).getTime();
      const differenceInMs = endTime - startTimeStamp;
      lastAttendance.status = "check-out";
      lastAttendance.checkOut = {
        status: "check-out",
        deviceOutTime: deviceTime,
        latitude: latitude,
        longitude: longitude,
      };
      lastAttendance.totalHours = differenceInMs / (1000 * 60 * 60);
    }

    await attendanceRecord.save();

    res.status(200).json({
      message: "Success",
      attendance:
        attendanceRecord.attendance[attendanceRecord.attendance.length - 1],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAttendanceById, postAttendanceByID };
