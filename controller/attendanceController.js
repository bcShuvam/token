const Attendance = require("../model/attendance");

const getAttendanceById = async (req, res) => {
  try {
    const id = req.query?.userId;
    if (!id) return res.status(400).json({ message: "userId is required" });
    const now = new Date();

    // Set the start of the day (00:00:00.000 UTC)
    now.setUTCHours(0, 0, 0, 0);
    const startDateTime = now;
    startDateTime.setUTCHours(0, 0, 0, 0);

    // Set the end of the day (23:59:59.999 UTC)
    const endDateTime = new Date(now);
    endDateTime.setUTCHours(23, 59, 59, 999);

    console.log("Start Date:", startDateTime.toISOString());
    console.log("End Date:", endDateTime.toISOString());

    if (!id) return res.status(400).json({ message: "ID is required" });
    const foundAttendance = await Attendance.findOne({ _id: id });
    if (!foundAttendance)
      return res.status(404).json({ message: `No user with ID ${id} found` });
    let lastAttendance = {};
    if (foundAttendance.attendance.length !== 0) {
      lastAttendance =
        foundAttendance.attendance[foundAttendance.attendance.length - 1];
    }
    // const filteredAttendance = attendance.attendance.filter((entry) => {
    //   const currentDate = new Date(entry.checkIn.inTime);
    //   console.log(currentDate);
    //   return currentDate >= startDateTime && currentDate <= endDateTime;
    // });
    // console.log(lastAttendance);
    res.status(200).json(lastAttendance);
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
      return res.status(404).json({ message: `No user with id ${id} found` });
    const startTime = new Date(from);
    startTime.setUTCHours(0, 0, 0, 0);
    const endTime = new Date(to);
    endTime.setUTCHours(23, 59, 59, 999);
    const filteredData = [];
    let totalHours = 0;
    const filteredAttendance = attendance.attendance.filter((entry) => {
      const currentDate = new Date(entry.checkIn.inTime);
      const matchedDate = currentDate >= startTime && currentDate <= endTime;
      if (matchedDate) {
        totalHours += entry.totalHours;
        console.log(totalHours);
        const data = {
          checkIn: entry.checkIn.deviceInTime,
          checkOut: entry.checkOut.deviceOutTime,
          totalHour: entry.totalHours,
        };
        filteredData.push(data);
      }
    });
    console.log(filteredData);
    const latestAttendance = {
      _id: attendance._id,
      username: attendance.username,
      filteredData,
    };
    res
      .status(200)
      .json({ message: "successful", totalHours, latestAttendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postAttendanceByID = async (req, res) => {
  try {
    const id = req.query?.userId;
    if (!id) return res.status(400).json({ message: "userId is required" });
    console.log("id received");
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
    console.log("all field received");

    const attendanceRecord = await Attendance.findById(id);
    console.log("attendanceRecord passed");
    if (!attendanceRecord) {
      return res.status(404).json({ message: `No user with id ${id} found` });
    }

    const lastAttendance =
      attendanceRecord.attendance[attendanceRecord.attendance.length - 1];
    console.log("last attendanceRecord passed");

    if (!lastAttendance || lastAttendance.status === "check-out") {
      console.log("inside if check lastAttendance passed");
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
      console.log("inside else if check lastAttendance passed");
      // Update the last "check-in" entry with "check-out" details
      const startTime = new Date(lastAttendance.checkIn.inTime);
      const endTime = new Date(attendanceTime);
      const startTimeStamp = new Date(startTime).getTime();
      const differenceInMs = endTime - startTimeStamp;
      attendanceRecord.username = attendanceRecord.username;
      lastAttendance.status = "check-out";
      lastAttendance.checkOut = {
        status: "check-out",
        deviceOutTime: deviceTime,
        outTime: attendanceTime,
        latitude: latitude,
        longitude: longitude,
      };
      lastAttendance.totalHours = differenceInMs / (1000 * 60 * 60);
      console.log("After saving attendance record passed");
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
