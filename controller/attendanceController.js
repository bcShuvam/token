
const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
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
    const foundAttendance = await Attendance.findOne({ _id: id });
    if (!foundAttendance)
      return res.status(404).json({ message: `No user with id ${id} found` });
    const startTime = new Date(from);
    startTime.setUTCHours(0, 0, 0, 0);
    const endTime = new Date(to);
    endTime.setUTCHours(23, 59, 59, 999);
    const attendanceLogs = [];
    let totalHours = 0;
    const filteredAttendance = foundAttendance.attendance.filter((entry) => {
      const currentDate = new Date(entry.checkIn.inTime);
      const matchedDate = currentDate >= startTime && currentDate <= endTime;
      if (matchedDate) {
        totalHours += entry.totalHours;
        console.log(totalHours);
        const data = {
          checkIn: entry.checkIn.deviceInTime,
          checkInLatitude: entry.checkIn.latitude,
          checkInLongitude: entry.checkIn.longitude,
          checkOut: entry.checkOut.deviceOutTime,
          checkOutLatitude: entry.checkOut.latitude,
          checkOutLongitude: entry.checkOut.longitude,
          totalHour: entry.totalHours,
        };
        attendanceLogs.push(data);
      }
    });
    // console.log(filteredData);
    const attendance = {
      _id: foundAttendance._id,
      username: foundAttendance.username,
      attendanceLogs,
    };

    const hours = Math.floor(totalHours); // Extract full hours
    const minutes = Math.floor((totalHours - hours) * 60); // Convert remaining fraction to minutes
    const seconds = Math.round(((totalHours - hours) * 60 - minutes) * 60); // Convert remaining fraction to seconds

    // Format with leading zeros
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    res
      .status(200)
      .json({ message: `successful, Attendance from ${startTime.toISOString()} to ${endTime.toISOString()}`, totalHours, totalTime: `${formattedHours}:${formattedMinutes}:${formattedSeconds}`, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportAttendanceToCSV = async (req, res) => {
  try {
    const id = req.query.userId;
    const { from, to } = req.query;

    if (!id) return res.status(400).json({ message: "id is required" });

    const foundAttendance = await Attendance.findOne({ _id: id });
    if (!foundAttendance) {
      return res.status(404).json({ message: `No user with id ${id} found` });
    }

    const startTime = new Date(from);
    startTime.setUTCHours(0, 0, 0, 0);
    const endTime = new Date(to);
    endTime.setUTCHours(23, 59, 59, 999);

    const attendanceLogs = [];
    foundAttendance.attendance.forEach((entry) => {
      const currentDate = new Date(entry.checkIn.inTime);
      if (currentDate >= startTime && currentDate <= endTime) {
        attendanceLogs.push({
          CheckIn: entry.checkIn.deviceInTime,
          CheckInLatitude: entry.checkIn.latitude,
          CheckInLongitude: entry.checkIn.longitude,
          CheckOut: entry.checkOut.deviceOutTime,
          CheckOutLatitude: entry.checkOut.latitude,
          CheckOutLongitude: entry.checkOut.longitude,
          TotalHours: entry.totalHours
        });
      }
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(attendanceLogs);

    // Convert worksheet to CSV
    const csvData = XLSX.utils.sheet_to_csv(worksheet);

    // Set headers for CSV download
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${foundAttendance.username}_${from}_to_${to}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


const getAllAttendanceByDate = async (req, res) => {
  try {
    const { from, to } = req.query;
    console.log("From:", from, "To:", to);

    // Fetch all users' attendance data
    const foundAttendance = await Attendance.find();
    // console.log("Fetched Attendance:", JSON.stringify(foundAttendance, null, 2));

    if (!foundAttendance || foundAttendance.length === 0) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    const startTime = new Date(from);
    startTime.setUTCHours(0, 0, 0, 0);
    const endTime = new Date(to);
    endTime.setUTCHours(23, 59, 59, 999);

    // Array to hold user attendance summaries
    const userAttendanceSummaries = foundAttendance.map((user) => {
      if (user.attendance && Array.isArray(user.attendance)) {
        // Filter attendance logs by date range
        const filteredAttendance = user.attendance.filter((entry) => {
          const currentDate = new Date(entry.checkIn.inTime);
          return currentDate >= startTime && currentDate <= endTime;
        });

        // Calculate total hours worked
        const totalHours = filteredAttendance.reduce((sum, entry) => sum + entry.totalHours, 0);

        // Format total hours into HH:MM:SS
        const hours = Math.floor(totalHours);
        const minutes = Math.floor((totalHours - hours) * 60);
        const seconds = Math.round(((totalHours - hours) * 60 - minutes) * 60);
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        console.log('************************ USER ********************************');
        console.log(user);  
        console.log('************************ FilteredAttendance ********************************');
        console.log(filteredAttendance);
        // console.log(filteredAttendance.checkIn);
        return {
          _id: user._id,
          username: user.username,
          profileImage: user?.profileImage ?? '',
          totalHoursWorked: filteredAttendance.length > 0 ? totalHours : 0,
          totalTime: filteredAttendance.length > 0 ? formattedTime : "00:00:00",
          checkInTime: filteredAttendance[0]?.checkIn?.deviceInTime ?? '',
          checkOutTime: filteredAttendance[0]?.checkIn?.deviceInTime ?? '',
          totalAttendance: filteredAttendance.length,
        };
      } else {
        return {
          _id: user._id,
          username: user.username,
          profileImage: user?.profileImage ?? '',
          totalHoursWorked: 0,
          totalTime: "00:00:00",
          checkInTime: '',
          checkOutTime: '',
          totalAttendance: 0,
        };
      }
    });

    res.status(200).json(userAttendanceSummaries);

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: error.message });
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

const downloadAttendanceReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const foundAttendance = await Attendance.find();
    if (!foundAttendance || foundAttendance.length === 0) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    const startTime = new Date(from);
    startTime.setUTCHours(0, 0, 0, 0);
    const endTime = new Date(to);
    endTime.setUTCHours(23, 59, 59, 999);

    const userAttendanceSummaries = foundAttendance.map((user) => {
      if (user.attendance && Array.isArray(user.attendance)) {
        const filteredAttendance = user.attendance.filter((entry) => {
          const currentDate = new Date(entry.checkIn.inTime);
          return currentDate >= startTime && currentDate <= endTime;
        });

        const totalHours = filteredAttendance.reduce((sum, entry) => sum + entry.totalHours, 0);

        const hours = Math.floor(totalHours);
        const minutes = Math.floor((totalHours - hours) * 60);
        const seconds = Math.round(((totalHours - hours) * 60 - minutes) * 60);
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return {
          _id: user._id,
          username: user.username,
          totalHoursWorked: filteredAttendance.length > 0 ? totalHours : 0,
          totalTime: filteredAttendance.length > 0 ? formattedTime : "00:00:00",
          totalAttendance: filteredAttendance.length,
        };
      } else {
        return {
          _id: user._id,
          username: user.username,
          totalHoursWorked: 0,
          totalTime: "00:00:00",
          totalAttendance: 0,
        };
      }
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(userAttendanceSummaries);

    // Convert worksheet to CSV
    const csvData = XLSX.utils.sheet_to_csv(worksheet);

    // Set headers for CSV download
    res.setHeader('Content-Disposition', `attachment; filename="attendance_report_${from}_to_${to}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const downloadAttendanceReportById = async (req, res) => {
  try {
    const id = req.query.userId;
    const { from, to } = req.query;

    if (!id) {
      return res.status(400).json({ message: "userId is required" });
    }

    const foundAttendance = await Attendance.findOne({ _id: id });

    if (!foundAttendance) {
      return res.status(404).json({ message: `No user with id ${id} found` });
    }

    const startTime = new Date(from);
    startTime.setUTCHours(0, 0, 0, 0);
    const endTime = new Date(to);
    endTime.setUTCHours(23, 59, 59, 999);

    const attendanceLogs = [];
    let totalHours = 0;

    const userName = foundAttendance.username; // <-- Corrected here

    foundAttendance.attendance.forEach((entry) => {
      const currentDate = new Date(entry.checkIn.inTime);
      const matchedDate = currentDate >= startTime && currentDate <= endTime;

      if (matchedDate) {
        totalHours += entry.totalHours;

        const data = {
          'Name': userName,
          'Check-In': entry.checkIn.deviceInTime,
          'Check-In Latitude': entry.checkIn.latitude,
          'Check-In Longitude': entry.checkIn.longitude,
          'Check-Out': entry.checkOut.deviceOutTime,
          'Check-Out Latitude': entry.checkOut.latitude,
          'Check-Out Longitude': entry.checkOut.longitude,
          'Total Hours': entry.totalHours.toFixed(2),
        };

        attendanceLogs.push(data);
      }
    });

    // Total time calculation (optional if you want to add to CSV later)
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const seconds = Math.round(((totalHours - hours) * 60 - minutes) * 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Convert attendanceLogs to CSV
    const fields = ['Name', 'Check-In', 'Check-In Latitude', 'Check-In Longitude', 'Check-Out', 'Check-Out Latitude', 'Check-Out Longitude', 'Total Hours'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(attendanceLogs);

    // Send CSV as file download
    res.header('Content-Type', 'text/csv');
    res.attachment(`${userName}_Attendance_Report_${from}_${to}.csv`);
    res.send(csv);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendanceById,
  postAttendanceByID,
  getAttendanceByIdAndDate,
  getAllAttendanceByDate,
  exportAttendanceToCSV,
  downloadAttendanceReport,
  downloadAttendanceReportById,
};