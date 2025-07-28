const mongoose = require("mongoose");

// const referralSchema = new mongoose.Schema(
//   {
//     referralId: { type: String, default: "" },
//     marketingOfficeId: { type: String, default: "" },
//     patientId: { type: String, default: "" },
//     mobileTime: { type: String, default: "" },
//     latitude: { type: Number, default: 0 },
//     longitude: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

const pocModel = new mongoose.Schema(
  {
    pocName: { type: String, required: true },
    age: { type: Number, default: 0 },
    gender: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    region: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: false, default: "" },
    specialization: { type: String, required: false, default: "" },
    organization: { type: String, required: false, default: "" },
    ambNumber: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, required: [true, "createdById is required"] },
    // createdByName: { type: String, required: true },
    visitCounter: { type: Number, default: 1 },
    referralCounter: { type: Number, default: 0 },
    // referral: [referralSchema],
  },
  { timestamps: true }
);

const POC = mongoose.model("POC", pocModel);

module.exports = POC;
