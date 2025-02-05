const mongoose = require("mongoose");

const patientModel = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    provisionalDiagnosis: { type: String, required: "" },
    weight: { type: Number, default: 0 },
    bloodGroup: { type: String, default: "" },
    number: { type: String, default: "" },
    email: { type: String, default: "" },
    country: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    createdByName: { type: String, required: true },
    createById: { type: String, required: true },
    pocId: { type: String, default: "" },
    pocName: { type: String, default: "" },
    ambId: { type: String, default: "" },
    ambDriverName: { type: String, default: "" },
    ambNumber: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    mobileTime: { type: String, required: true },
    dateTime: { type: Date, required: true },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientModel);

module.exports = Patient;
