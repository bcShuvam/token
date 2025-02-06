const Patient = require("../model/patient");
const POC = require("../model/poc");
const Referral = require("../model/referral");
const mongoose = require("mongoose");

const createReferral = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      provisionalDiagnosis,
      weight,
      bloodGroup,
      number,
      email,
      country,
      region,
      city,
      address,
      createdById,
      createdByName,
      pocId,
      pocName,
      pocNumber,
      ambId,
      ambDriverName,
      ambNumber,
      ambDriverNumber,
      latitude,
      longitude,
      mobileTime,
      dateTime,
    } = req.body;
    if (
      !fullName ||
      !age ||
      !gender ||
      !provisionalDiagnosis ||
      !country ||
      !region ||
      !city ||
      !address ||
      !createdById ||
      !createdByName ||
      !mobileTime ||
      !latitude ||
      !longitude ||
      !dateTime
    )
      return res.status(400).json({
        message:
          "fullName, age, gender, provisionalDiagnosis, number, country, region, city, address, createdById, createdByName, mobileTime, dateTime, latitude, longitude createdById, createdByName are required",
      });
    const foundReferralId = await Referral.findById(createdById);
    if (!foundReferralId)
      return res
        .status(404)
        .json({ message: `referral id '${createdById}' not found` });
    let foundPOCId;
    let foundAmbId;
    if (pocId) {
      foundPOCId = await POC.findById(pocId);
      if (!foundReferralId)
        return res.status(404).json({ message: `POC id '${pocId}' not found` });
    }
    if (ambId) {
      foundAmbId = await POC.findById(ambId);
      if (!foundReferralId)
        return res
          .status(404)
          .json({ message: `Ambulance id '${ambId}' not found` });
    }
    const createPatient = await Patient.create({
      fullName: fullName,
      age: age,
      gender: gender,
      weight: weight,
      bloodGroup: bloodGroup,
      number: number,
      email: email,
      provisionalDiagnosis: provisionalDiagnosis,
      country: country,
      region: region,
      city: city,
      address: address,
      createdByName: createdByName,
      createById: createdById,
      pocId: pocId,
      pocName: pocName,
      pocNumber: pocNumber,
      ambId: ambId,
      ambDriverName: ambDriverName,
      ambNumber: ambNumber,
      ambDriverNumber: ambDriverNumber,
      latitude: latitude,
      longitude: longitude,
      mobileTime: mobileTime,
      dateTime: dateTime,
    });
    const referralLogDetail = {
      patientId: createPatient._id,
      patientName: createPatient.fullName,
      createdById: createdById,
      createdByName: createdByName,
      pocId: pocId,
      pocName: pocName,
      pocNumber: pocNumber,
      ambId: ambId,
      ambDriverName: ambDriverName,
      ambNumber: ambNumber,
      ambDriverNumber: ambDriverNumber,
      latitude: latitude,
      longitude: longitude,
      mobileTime: mobileTime,
      referralDate: dateTime,
    };
    const updatedReferral = await Referral.findByIdAndUpdate(createdById, {
      $inc: { referralLogCounter: 1 },
      $push: { referralLogs: referralLogDetail },
    });
    const latestReferral =
      updatedReferral.referralLogs.length == 0
        ? {}
        : updatedReferral.referralLogs[updatedReferral.referralLogs.length - 1];
    res.status(200).json({
      message: "success",
      latestReferral,
      createPatient,
      foundReferralId,
      foundPOCId,
      foundAmbId,
      updatedReferral,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = createReferral;
