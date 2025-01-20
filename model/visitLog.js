const mongoose = require("mongoose");

const visitLogModel = new mongoose.Schema(
  {
    pocId: { type: String, required: true },
    pocName: { type: String, required: true },
    remarks: { type: String, required: true },
    mobileTime: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

const visitModel = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    visitLogCounter: { type: Number, default: 0 },
    visitLogs: [visitLogModel],
  },
  { timestamps: true }
);

const VisitLog = mongoose.model("VisitLog", visitModel);

module.exports = VisitLog;
