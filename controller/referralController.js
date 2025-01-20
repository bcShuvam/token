const Patient = require("../model/patient");
const POC = require("../model/poc");
const Referral = require("../model/referral");

const createReferral = async (req, res) => {
  const {
    patientId,
    patientName,
    createdById,
    createdByName,
    pocId,
    pocName,
    ambId,
    ambDriverName,
    ambNumber,
  } = req.body;
  //   if (!patientId || !patientName || !createdById || !createdByName)
  //     return res.status(400).json({
  //       message:
  //         "patientId, patientName, createdById, createdByName are required",
  //     });
  const createPatient = await Patient.create({
    fullName: fullName,
    age: age,
    gender: gender,
    weight: weight,
    bloodGroup: bloodGroup,
    number: number,
    email: email,
    county: country,
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
  const foundReferralId = await Referral.findById(createdById);
  const foundPOCId = await POC.findById(pocId);
  const foundAmbId = await POC.findById(ambId);
  res.status(200).json({ message: "success" });
};

module.exports = createReferral;
