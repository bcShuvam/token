const mongoose = require("mongoose");

const attendanceModel = new mongoose.Schema(
  {
    status: { type: String, default: "" },
    checkIn: {
      status: { type: String, default: "" },
      deviceInTime: { type: String, default: "" },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    checkOut: {
      status: { type: String, default: "" },
      deviceOutTime: { type: String, default: "" },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    overTimeIn: {
      status: { type: String, default: "" },
      deviceInTime: { type: String, default: "" },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    overTimeOut: {
      status: { type: String, default: "" },
      deviceOutTime: { type: String, default: "" },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    totalHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const attendanceSchema = mongoose.Schema({
  _id: { type: String, required: true },
  attendance: [attendanceModel],
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
