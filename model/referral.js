const mongoose = require("mongoose");

const referralLogModel = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    createdById: { type: String, required: true },
    createdByName: { type: String, required: true },
    pocId: { type: String, default: "" },
    pocName: { type: String, default: "" },
    ambId: { type: String, default: "" },
    ambDriverName: { type: String, default: "" },
    ambNumber: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    mobileTime: { type: String, required: true },
    referralDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const referralModel = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    referralLogCounter: { type: Number, default: 0 },
    referralLogs: [referralLogModel],
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", referralModel);

module.exports = Referral;
