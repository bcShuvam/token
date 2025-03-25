const Patient = require("../model/patient");
const POC = require("../model/poc");
const Referral = require("../model/referral");
const Users = require("../model/users");
const nodemailer = require("nodemailer");
// const csv = require("csvtojson");
const CsvParser = require("json2csv").Parser;
let exportData;

const exportCSVData = async (req, res) => {
  try {
    if (!exportData) return res.status(404).json({ message: "No data to export" });
     exportData;
    const csvFields = [
      "ID",
      "Patient Id",
      "Patient Name",
      "Created By Id",
      "Created By Name",
      "Poc Id",
      "Poc Name",
      "Poc Number",
      "Ambulance Id",
      "Ambulance Driver Name",
      "Ambulance Driver Number",
      "Ambulance Number",
      "Latitude",
      "Longitude",
      "Mobile Time",
      "Referral Date",
    ];
    const csvParser = new CsvParser({csvFields});
    const csvData = csvParser.parse(exportData);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment: filename=referralDataById.csv");
    return res.status(200).end(csvData);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

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

  const id = foundReferral._id;
  const foundUser = await Users.findById(id);

  const formattedReferral = filteredReferrals.map((ref) => ({
    "_id": ref._id,
    "patientId": ref.patientId,
    "patientName": ref.patientName,
    "createdById": ref.createdById,
    "profileImage": foundUser.profileImage,
    "createdByName": ref.createdByName,
    "pocId": ref.pocId,
    "pocName": ref.pocName,
    "pocNumber": ref.pocNumber,
    "ambId": ref.ambId,
    "ambDriverName": ref.ambDriverName,
    "ambDriverNumber": ref.ambDriverNumber,
    "ambNumber": ref.ambNumber,
    "latitude": ref.latitude,
    "longitude": ref.longitude,
    "mobileTime": ref.mobileTime,
    "referralDate": ref.referralDate,
  }));
  console.log(formattedReferral);
  exportData = formattedReferral;
  res.status(200).json({ message: "success", referralLogs: formattedReferral });
};

const getReferralByDateCountryRegionAndCity = async (req, res) => {
  try {
    const { _id, from, to, country, region, city } = req.query;
    if (!_id) return res.status(400).json({ message: "_id is required" });
    if (!from || !to || !country || !region || !city)
      return res.status(400).json({ message: "from, to and country, region and city are required" });

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

        if (foundPatient.country == country && foundPatient.region == region && foundPatient.city == city) {
          data = {
            referral: logs,
            patient: foundPatient,
            poc: foundPoc,
            amb: foundAmb,
          }
        }

        if (Object.keys(data).length !== 0) {
          formattedReferralData.push(data);
        }
      }
    }

    const id = foundReferral._id;
    const foundUser = await Users.findById(id);

    const formattedReferral = formattedReferralData.map((logs) => ({
      _id: logs.referral._id,
      createdById: logs.referral.createdById,
      createdBy: logs.referral.createdByName,
      profileImage: foundUser.profileImage,
      referralDate: logs.referral.referralDate,
      mobileTime: logs.referral.mobileTime,
      latitude: logs.referral.latitude,
      longitude: logs.referral.longitude,
      patientId: logs.patient._id,
      patientName: logs.patient.fullName,
      patientAge: logs.patient.age,
      provisionalDiagnosis: logs.patient.provisionalDiagnosis,
      country: logs.patient.country,
      region: logs.patient.region,
      city: logs.patient.city,
      address: logs.patient.address,
      city: logs.patient.city,
      pocName: logs.poc.pocName,
      pocAge: logs.poc.age,
      pocNumber: logs.poc.number,
      pocGender: logs.poc.gender,
      pocCountry: logs.poc.country,
      pocRegion: logs.poc.region,
      pocCity: logs.poc.city,
      pocAddress: logs.poc.address,
      pocCategory: logs.poc.category,
      pocSpecialization: logs.poc.specialization,
      pocOrganization: logs.poc.organization,
      ambId: logs.amb._id,
      ambName: logs.amb.pocName,
      ambAge: logs.amb.age,
      ambNumber: logs.amb.number,
      ambCountry: logs.amb.country,
      ambRegion: logs.amb.region,
      ambCity: logs.amb.city,
      ambAddress: logs.amb.address,
      ambOrganization: logs.amb.organization,
      ambVehicleNumber: logs.amb.ambNumber,
    }));

    res.status(200).json({ message: "success", referralLogs: formattedReferral });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReferralByDateCountryAndRegion = async (req, res) => {
  try {
    const { _id, from, to, country, region, city } = req.query;
    if (!_id) return res.status(400).json({ message: "_id is required" });
    if (!from || !to || !country || !region)
      return res.status(400).json({ message: "from, to and country and region are required" });

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

        if (foundPatient.country == country && foundPatient.region == region) {
          data = {
            referral: logs,
            patient: foundPatient,
            poc: foundPoc,
            amb: foundAmb,
          }
        }

        if (Object.keys(data).length !== 0) {
          formattedReferralData.push(data);
        }
      }
    }

    const id = foundReferral._id;
    const foundUser = await Users.findById(id);

    const formattedReferral = formattedReferralData.map((logs) => ({
      _id: logs.referral._id,
      createdById: logs.referral.createdById,
      createdBy: logs.referral.createdByName,
      profileImage: foundUser.profileImage,
      referralDate: logs.referral.referralDate,
      mobileTime: logs.referral.mobileTime,
      latitude: logs.referral.latitude,
      longitude: logs.referral.longitude,
      patientId: logs.patient._id,
      patientName: logs.patient.fullName,
      patientAge: logs.patient.age,
      provisionalDiagnosis: logs.patient.provisionalDiagnosis,
      country: logs.patient.country,
      region: logs.patient.region,
      city: logs.patient.city,
      address: logs.patient.address,
      city: logs.patient.city,
      pocName: logs.poc.pocName,
      pocAge: logs.poc.age,
      pocNumber: logs.poc.number,
      pocGender: logs.poc.gender,
      pocCountry: logs.poc.country,
      pocRegion: logs.poc.region,
      pocCity: logs.poc.city,
      pocAddress: logs.poc.address,
      pocCategory: logs.poc.category,
      pocSpecialization: logs.poc.specialization,
      pocOrganization: logs.poc.organization,
      ambId: logs.amb._id,
      ambName: logs.amb.pocName,
      ambAge: logs.amb.age,
      ambNumber: logs.amb.number,
      ambCountry: logs.amb.country,
      ambRegion: logs.amb.region,
      ambCity: logs.amb.city,
      ambAddress: logs.amb.address,
      ambOrganization: logs.amb.organization,
      ambVehicleNumber: logs.amb.ambNumber,
    }));

    res.status(200).json({ message: "success", referralLogs: formattedReferral });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReferralByDateAndCountry = async (req, res) => {
  try {
    const { _id, from, to, country, region, city } = req.query;
    if (!_id) return res.status(400).json({ message: "_id is required" });
    if (!from || !to || !country)
      return res.status(400).json({ message: "from, to and country are required" });

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

        if (foundPatient.country == country) {
          data = {
            referral: logs,
            patient: foundPatient,
            poc: foundPoc,
            amb: foundAmb,
          }
        }

        if (Object.keys(data).length !== 0) {
          formattedReferralData.push(data);
        }
      }
    }

    const id = foundReferral._id;
    const foundUser = await Users.findById(id);

    const formattedReferral = formattedReferralData.map((logs) => ({
      _id: logs.referral._id,
      createdById: logs.referral.createdById,
      profileImage: foundUser.profileImage,
      createdBy: logs.referral.createdByName,
      referralDate: logs.referral.referralDate,
      mobileTime: logs.referral.mobileTime,
      latitude: logs.referral.latitude,
      longitude: logs.referral.longitude,
      patientId: logs.patient._id,
      patientName: logs.patient.fullName,
      patientAge: logs.patient.age,
      provisionalDiagnosis: logs.patient.provisionalDiagnosis,
      country: logs.patient.country,
      region: logs.patient.region,
      city: logs.patient.city,
      address: logs.patient.address,
      city: logs.patient.city,
      pocName: logs.poc.pocName,
      pocAge: logs.poc.age,
      pocNumber: logs.poc.number,
      pocGender: logs.poc.gender,
      pocCountry: logs.poc.country,
      pocRegion: logs.poc.region,
      pocCity: logs.poc.city,
      pocAddress: logs.poc.address,
      pocCategory: logs.poc.category,
      pocSpecialization: logs.poc.specialization,
      pocOrganization: logs.poc.organization,
      ambId: logs.amb._id,
      ambName: logs.amb.pocName,
      ambAge: logs.amb.age,
      ambNumber: logs.amb.number,
      ambCountry: logs.amb.country,
      ambRegion: logs.amb.region,
      ambCity: logs.amb.city,
      ambAddress: logs.amb.address,
      ambOrganization: logs.amb.organization,
      ambVehicleNumber: logs.amb.ambNumber,
    }));

    res.status(200).json({ message: "success", referralLogs: formattedReferral });
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

module.exports = { getReferralById, getReferralByDateCountryRegionAndCity, getReferralByDateCountryAndRegion, getReferralByDateAndCountry, createReferral, exportCSVData };
