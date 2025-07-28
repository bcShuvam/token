const mongoose = require("mongoose");

const patientReferralSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    age: { type: Number, required: false, default: null },
    gender: { type: String, required: true },
    provisionalDiagnosis: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    bloodGroup: { type: String, default: "" },
    number: { type: String, default: "" },
    email: { type: String, default: "" },
    country: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "userId is required"] },
    pocId: { type: mongoose.Schema.Types.ObjectId, ref: "POC", default: null },
    ambId: { type: mongoose.Schema.Types.ObjectId, ref: "POC", default: null },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    mobileTime: { type: String, required: [true, "Mobile time is required"] },
    createdAt: { type: Date, default: new Date },
    approvalStatus: {type: String, default: "Pending"} // Approved, Pending, Rejected
  },
  { timestamps: true }
);

const PatientReferral = mongoose.model("PatientReferral", patientReferralSchema);

module.exports = PatientReferral;
