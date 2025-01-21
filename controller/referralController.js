const Patient = require("../model/patient");
const POC = require("../model/poc");
const Referral = require("../model/referral");

const createReferral = async (req, res) => {
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
    !number ||
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
  const foundReferralId = await Referral.findById(createdById);
  const foundPOCId = await POC.findById(pocId);
  const foundAmbId = await POC.findById(ambId);
  res.status(200).json({ message: "success" });
};

module.exports = createReferral;
