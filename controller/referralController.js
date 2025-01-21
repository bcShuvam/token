const Patient = require("../model/patient");
const POC = require("../model/poc");
const Referral = require("../model/referral");

const createReferral = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
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
      ambId,
      ambDriverName,
      ambNumber,
      latitude,
      longitude,
      mobileTime,
    } = req.body;
    if (
      !fullName ||
      !age ||
      !gender ||
      !country ||
      !region ||
      !city ||
      !address ||
      !createdById ||
      !createdByName ||
      !mobileTime ||
      !latitude ||
      !longitude
    )
      return res.status(400).json({
        message:
          "fullName, age, gender, number, country, region, city, address, createdById, createdByName, mobileTime, latitude, longitude createdById, createdByName are required",
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
      country: country,
      region: region,
      city: city,
      address: address,
      createdByName: createdByName,
      createById: createdById,
      pocId: pocId,
      pocName: pocName,
      ambId: ambId,
      ambDriverName: ambDriverName,
      ambNumber: ambNumber,
      latitude: latitude,
      longitude: longitude,
      mobileTime: mobileTime,
    });
    const referralLogDetail = {
      patientId: createPatient._id,
      patientName: createPatient.fullName,
      createdById: createdById,
      createdByName: createdByName,
      pocId: pocId,
      pocName: pocName,
      ambId: ambId,
      ambDriverName: ambDriverName,
      ambNumber: ambNumber,
      latitude: latitude,
      longitude: longitude,
      mobileTime: mobileTime,
    };
    const updatedReferralById = await Referral.updateOne(
      {
        _id: createdById,
      },
      {
        $inc: { referralLogCounter: 1 },
        $push: { referralLogs: referralLogDetail },
      }
    );
    // const pocReferralDetail = {};
    // const updatedPocReferralById = await POC.updateOne(
    //   { _id: pocId },
    //   { $inc: { referralCounter: 1 }, $push: { visitLogs: pocReferralDetail } }
    // );
    res.status(200).json({
      message: "success",
      updatedReferralById,
      createPatient,
      foundReferralId,
      foundPOCId,
      foundAmbId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = createReferral;
