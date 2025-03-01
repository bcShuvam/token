const Patient = require("../model/patient");
const POC = require("../model/poc");
const Referral = require("../model/referral");
const nodemailer = require("nodemailer");

const getReferralById = async (req, res) => {
  const { _id, from, to } = req.query;
  if (!_id) return res.status(400).json({ message: "_id is required" });
  if (!from || !to)
    return res.status(400).json({ message: "from and to are required" });
  const referralDateFrom = new Date(from);
  referralDateFrom.setUTCHours(0, 0, 0, 0);
  const referralDateTo = new Date(to);
  referralDateTo.setUTCHours(23, 59, 59, 999);
  const foundReferral = await Referral.findById(_id);
  if (!foundReferral)
    return res
      .status(404)
      .json({ message: "no referral found", referralLogs: {} });
  const filteredReferrals = foundReferral.referralLogs.filter((logs) => {
    const date = new Date(logs.referralDate);
    return date >= referralDateFrom && date <= referralDateTo;
  });
  console.log(filteredReferrals);
  res.status(200).json({ message: "success", referralLogs: filteredReferrals });
};

const getReferralByDateAndRegion = async (req, res) => {
  try {
    const { _id, from, to, country, region, city } = req.query;
    if (!_id) return res.status(400).json({ message: "_id is required" });
    if (!from || !to || !country || !region)
      return res.status(400).json({ message: "from, to, country and region are required" });

    const referralDateFrom = new Date(from);
    referralDateFrom.setUTCHours(0, 0, 0, 0);
    const referralDateTo = new Date(to);
    referralDateTo.setUTCHours(23, 59, 59, 999);

    const foundReferral = await Referral.findById(_id);
    if (!foundReferral)
      return res.status(404).json({ message: "no referral found", referralLogs: {} });

    let filteredReferrals = foundReferral.referralLogs.filter((logs) => {
      const date = new Date(logs.referralDate);
      return date >= referralDateFrom && date <= referralDateTo;
    });

    let formattedReferralData = [];

    if (filteredReferrals.length !== 0) {
      for (const logs of filteredReferrals) {
        const foundPoc = logs.pocId ? await POC.findOne({ _id: logs.pocId }) : {};
        const foundAmb = logs.ambId ? await POC.findOne({ _id: logs.ambId }) : {};
        const foundPatient = logs.patientId ? await Patient.findOne({ _id: logs.patientId }) : {};

        let data = {};

        if(foundPatient.country == country && foundPatient.region == region){
          data = {
            referral: logs,
            patient: foundPatient,
            poc: foundPoc,
            amb: foundAmb,
          }
        }

        if (data) {
          formattedReferralData.push(data);
        }
      }
    }

    res.status(200).json({ message: "success", referralLogs: formattedReferralData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


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

module.exports = { getReferralById, getReferralByDateAndRegion, createReferral };
