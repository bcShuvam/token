const mongoose = require("mongoose");

const visitLogModel = new mongoose.Schema(
  {
    pocId: { type: mongoose.Schema.Types.ObjectId, ref: "POC", required: [true, "pocId is required"]},
    pocName: { type: String, required: true },
    remarks: { type: String, required: true },
    mobileTime: { type: String, required: true },
    visitDate: { type: Date, required: true },
    visitType: { type: String, required: true },
    approvalStatus: { type: String, default: "pending" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

const visitModel = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    visitLogCounter: { type: Number, default: 0 },
    visitLogs: [visitLogModel],
  },
  { timestamps: true }
);

const VisitLog = mongoose.model("VisitLog", visitModel);

module.exports = VisitLog;
