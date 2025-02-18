const mongoose = require("mongoose");

const attendanceModel = new mongoose.Schema(
  {
    status: { type: String, default: "" },
    checkIn: {
      status: { type: String, default: "" },
      deviceInTime: { type: String, default: "" },
      inTime: { type: Date },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    checkOut: {
      status: { type: String, default: "" },
      deviceOutTime: { type: String, default: "" },
      outTime: { type: Date },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    totalHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const attendanceSchema = mongoose.Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    attendance: [attendanceModel],
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;

// status in out o-in o-out
// employee id
// timestamp
