const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: [true, "patientId is required"] },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "userId is required"] },
    pocId: { type: mongoose.Schema.Types.ObjectId, ref: "POC", default: null },
    ambId: { type: mongoose.Schema.Types.ObjectId, ref: "POC", default: null },
    latitude: { type: Number, required: [true, "latitude is required"] },
    longitude: { type: Number, required: [true, "longitude is required"] },
    mobileTime: { type: String, required: [true, "mobileTime is required"] },
    referralDate: { type: Date, default: new Date },
    approvalStatus: {type: String, default: "Pending"} // Approved, Pending, Rejected
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;
