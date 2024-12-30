const mongoose = require("mongoose");

const attendanceSchema = mongoose.Schema(
  {
    _id: { type: String, required: true },
    attendance: [
      {
        status: { type: String, default: "" },
        checkIn: [
          { deviceTime: { type: String, default: "" } },
          { timestamps: true },
        ],
        checkOut: [
          { deviceTime: { type: String, default: "" } },
          { timestamps: true },
        ],
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
      },
    ],
  },
  { _id: false }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
