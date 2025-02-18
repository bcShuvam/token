const Attendance = require("../model/attendance");

const getAttendanceById = async (req, res) => {
  try {
    const id = req.query?.userId;
    if (!id) return res.status(400).json({ message: "userId is required" });
    const now = new Date();

    // Set the start of the day (00:00:00.000 UTC)
    now.setUTCHours(0, 0, 0, 0);
    const startDateTime = now;

    // Set the end of the day (23:59:59.999 UTC)
    const endDateTime = new Date(now);
    endDateTime.setUTCHours(23, 59, 59, 999);

    console.log("Start Date:", startDateTime.toISOString());
    console.log("End Date:", endDateTime.toISOString());

    if (!id) return res.status(400).json({ message: "ID is required" });
    const attendance = await Attendance.findOne({ _id: id });
    if (!attendance)
      return res.status(404).json({ message: `No user with ID ${id} found` });
    const filteredAttendance = attendance.attendance.filter((entry) => {
      const currentDate = new Date(entry.createdAt);
      console.log(currentDate);
      return currentDate >= startDateTime && currentDate <= endDateTime;
    });
    console.log(filteredAttendance);
    res.status(200).json(filteredAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceByIdAndDate = async (req, res) => {
  try {
    const id = req.query.userId;
    const { from, to } = req.query;
    console.log(from, to);
    if (!id) return res.status(400).json({ message: "id is required" });
    const attendance = await Attendance.findOne({ _id: id });
    if (!attendance)
      return res.status(404).json({ message: `No user with ID ${id} found` });
    const startTime = new Date(from);
    const endTime = new Date(to);
    const filteredData = [];
    let totalHours = 0;
    const filteredAttendance = attendance.attendance.filter((entry) => {
      const currentDate = new Date(entry.createdAt);
      const matchedDate = currentDate >= startTime && currentDate <= endTime;
      if (matchedDate) {
        totalHours += entry.totalHours;
        console.log(totalHours);
        const data = {
          totalHours: totalHours,
          checkIn: entry.createdAt,
        };
        filteredData.push(data);
      }
    });
    console.log(filteredData);
    const latestAttendance = {
      _id: attendance._id,
      filteredAttendance,
    };
    res.status(200).json({ message: "successful", latestAttendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postAttendanceByID = async (req, res) => {
  try {
    const id = req.query?.userId;
    if (!id) return res.status(400).json({ message: "userId is required" });

    const { deviceTime, attendanceTime, latitude, longitude } = req.body;
    if (
      !deviceTime ||
      !attendanceTime ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message:
          "deviceTime, attendanceTime, latitude, and longitude are required",
      });
    }

    // Fetch user details to get the username
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: `No user with id ${id} found` });
    }

    let attendanceRecord = await Attendance.findById(id);

    // If attendance record does not exist, create a new one
    if (!attendanceRecord) {
      attendanceRecord = new Attendance({
        _id: id,
        username: user.username, // Ensure username is assigned
        attendance: [],
      });
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
          inTime: attendanceTime,
          latitude: latitude,
          longitude: longitude,
        },
        checkOut: {
          status: "",
          deviceOutTime: "",
          outTime: "",
          latitude: 0,
          longitude: 0,
        },
      });
    } else if (lastAttendance.status === "check-in") {
      // Update the last "check-in" entry with "check-out" details
      const startTime = new Date(lastAttendance.checkIn.inTime);
      const endTime = new Date(attendanceTime);
      const differenceInMs = endTime - startTime;
      lastAttendance.status = "check-out";
      lastAttendance.checkOut = {
        status: "check-out",
        deviceOutTime: deviceTime,
        outTime: attendanceTime,
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
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAttendanceById,
  postAttendanceByID,
  getAttendanceByIdAndDate,
};
