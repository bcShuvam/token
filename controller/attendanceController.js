const Attendance = require("../model/attendance");

const getAttendanceById = async (req, res) => {
  try {
    const userID = req.params?.id;
    if (!userID) return res.status(400).json({ message: "ID is required" });
    const attendance = await Attendance.findOne({ userId: userID });
    if (!attendance)
      return res
        .status(404)
        .json({ message: `No user with ID ${userID} found` });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = getAttendanceById;
