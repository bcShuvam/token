const PatientReferral = require("../model/patient");
const POC = require("../model/poc");
const Referral = require("../model/referral");
const Users = require("../model/users");
const nodemailer = require("nodemailer");
// const csv = require("csvtojson");
const CsvParser = require("json2csv").Parser;
const moment = require("moment-timezone");
const BS = require('bikram-sambat-js');
const mongoose = require("mongoose");
// const NepaliDate = require('nepali-date-converter');
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
    const csvParser = new CsvParser({ csvFields });
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
  console.log(filteredReferrals);

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
  // console.log(formattedReferral);
  exportData = formattedReferral;
  res.status(200).json({ message: "success", referralLogs: formattedReferral });
};

const getReferralByIdAndDate = async (req, res) => {
  try {
    const {id, from, to} = req.params;
    if(!id || !from || !to) return res.status(400).json({message: "user id, from and to are required"})
    const foundReferral = await Referral.findById(id);
    if(!foundReferral) return res.status(404).json({message: "No Referrals found", referral: foundReferral})
    // console.log(foundReferral);  
    return res.status(200).json({message: "Referral found", referrals: foundReferral})
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
}

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

const XLSX = require('xlsx');

const downloadReferralByDateAndCountryCSV = async (req, res) => {
  try {
    const { _id, from, to, country } = req.query;
    if (!_id) return res.status(400).json({ message: "_id is required" });
    if (!from || !to || !country)
      return res.status(400).json({ message: "from, to, and country are required" });

    const referralDateFrom = new Date(from);
    referralDateFrom.setUTCHours(0, 0, 0, 0);
    const referralDateTo = new Date(to);
    referralDateTo.setUTCHours(23, 59, 59, 999);

    const foundReferral = await Referral.findById(_id);
    if (!foundReferral)
      return res.status(404).json({ message: "No referral found" });

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
          };
        }

        if (Object.keys(data).length !== 0) {
          formattedReferralData.push(data);
        }
      }
    }

    const id = foundReferral._id;
    const foundUser = await Users.findById(id);

    const formattedReferral = formattedReferralData.map((logs) => ({
      _id: logs.referral._id?.toString() || '',
      createdById: logs.referral.createdById?.toString() || '',
      profileImage: foundUser.profileImage || '',
      createdBy: logs.referral.createdByName || '',
      referralDate: logs.referral.referralDate || '',
      mobileTime: logs.referral.mobileTime || '',
      latitude: logs.referral.latitude || '',
      longitude: logs.referral.longitude || '',
      patientId: logs.patient._id?.toString() || '',
      patientName: logs.patient.fullName || '',
      patientAge: logs.patient.age || '',
      provisionalDiagnosis: logs.patient.provisionalDiagnosis || '',
      country: logs.patient.country || '',
      region: logs.patient.region || '',
      city: logs.patient.city || '',
      address: logs.patient.address || '',
      pocName: logs.poc.pocName || '',
      pocAge: logs.poc.age || '',
      pocNumber: logs.poc.number || '',
      pocGender: logs.poc.gender || '',
      pocCountry: logs.poc.country || '',
      pocRegion: logs.poc.region || '',
      pocCity: logs.poc.city || '',
      pocAddress: logs.poc.address || '',
      pocCategory: logs.poc.category || '',
      pocSpecialization: logs.poc.specialization || '',
      pocOrganization: logs.poc.organization || '',
      ambId: logs.amb._id?.toString() || '',
      ambName: logs.amb.pocName || '',
      ambAge: logs.amb.age || '',
      ambNumber: logs.amb.number || '',
      ambCountry: logs.amb.country || '',
      ambRegion: logs.amb.region || '',
      ambCity: logs.amb.city || '',
      ambAddress: logs.amb.address || '',
      ambOrganization: logs.amb.organization || '',
      ambVehicleNumber: logs.amb.ambNumber || '',
    }));

    // Now export formattedReferral as CSV
    const worksheet = XLSX.utils.json_to_sheet(formattedReferral);
    const csvData = XLSX.utils.sheet_to_csv(worksheet);

    res.setHeader('Content-Disposition', `attachment; filename="referral_logs_${from}_to_${to}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


const createPatientReferral = async (req, res) => {
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
      userId,
      pocId,
      ambId,
      latitude,
      longitude,
      mobileTime,
    } = req.body;
    if (
      !fullName ||
      !gender ||
      !country ||
      !region ||
      !city ||
      !address ||
      !userId ||
      !mobileTime ||
      !latitude ||
      !longitude
    )
      return res.status(400).json({
        message:
          "fullName, age, gender, provisionalDiagnosis, number, country, region, city, address, createdById, createdByName, mobileTime, dateTime, latitude, longitude createdById, createdByName are required",
      });

      let foundPOCId;
      let foundAmbId;

    if (pocId) {
      foundPOCId = await POC.findById(pocId);
      if (!foundPOCId) {
        return res.status(404).json({ message: `POC id '${pocId}' not found` });
      }
    }

    if (ambId) {
      foundAmbId = await POC.findById(ambId);
      if (!foundAmbId) {
        return res
          .status(404)
          .json({ message: `Ambulance id '${ambId}' not found` });
      }
    }
    
    const createPatient = await PatientReferral.create({
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
      userId: userId,
      pocId: pocId,
      ambId: ambId,
      latitude: latitude,
      longitude: longitude,
      mobileTime: mobileTime
    });

    const referralLogDetail = {
      patientId: createPatient._id,
      patientName: createPatient.fullName,
      userId: userId,
      pocId: pocId,
      ambId: ambId,
      latitude: latitude,
      longitude: longitude,
      mobileTime: mobileTime,
      createdAt: createPatient.createdAt,
      approvalStatus: createPatient.approvalStatus
    };

    res.status(201).json({
      message: "success",
      referralLogDetail
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReferralStatsByUsers = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "Query parameters 'from' and 'to' are required" });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);
    const totalDays = Math.max(1, moment(endDate).diff(moment(startDate), 'days') + 1);

    // 1. Get all non-admin users
    const users = await Users.find({ "role.role": { $ne: "Admin" } }).select("username profileImage");

    const userIds = users.map(u => u._id);

    // 2. Get referrals for those users in the given range
    const referrals = await PatientReferral.find({
      userId: { $in: userIds },
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate("userId", "username profileImage");

    // 3. Group referrals per user
    const userStats = users.map(user => {
      const userReferrals = referrals.filter(r => r.userId?._id.toString() === user._id.toString());
      const total = userReferrals.length;
      const latestMobileTime = userReferrals.sort((a, b) => new Date(b.mobileTime) - new Date(a.mobileTime))[0]?.mobileTime || null;

      return {
        userId: user._id,
        username: user.username,
        profileImage: user.profileImage,
        totalReferral: total,
        averageReferralPerDay: +(total / totalDays).toFixed(2),
        mobileTime: latestMobileTime
      };
    });

    // 4. Global stats
    const totalReferralCount = referrals.length;
    const averageReferralPerDay = +(totalReferralCount / totalDays).toFixed(2);
    const averageReferralPerUser = +(totalReferralCount / users.length).toFixed(2);

    res.status(200).json({
      totalReferralCount,
      averageReferralPerDay,
      averageReferralPerUser,
      data: userStats
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const allowedStatuses = ["Approved", "Pending", "Rejected"];

const updateMultipleApprovalStatuses = async (req, res) => {
  try {
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of updates",
      });
    }

    // Validate each entry
    for (const update of updates) {
      if (!update.referralId || !mongoose.Types.ObjectId.isValid(update.referralId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid referralId: ${update.referralId}`,
        });
      }
      if (!update.approvalStatus || !allowedStatuses.includes(update.approvalStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid approvalStatus for referralId ${update.referralId}. Allowed values: ${allowedStatuses.join(", ")}`,
        });
      }
    }

    let updatedCount = 0;

    // Update each record individually (different status for each)
    for (const update of updates) {
      const result = await Referral.updateOne(
        { _id: update.referralId },
        { $set: { approvalStatus: update.approvalStatus } }
      );
      if (result.modifiedCount > 0) updatedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `${updatedCount} referral(s) updated successfully`,
    });

  } catch (error) {
    console.error("Error updating approvalStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const nepaliMonthsEnglish = [
  "", "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const downloadReferralStatsByUsersCSV = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "Query parameters 'from' and 'to' are required" });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);
    const totalDays = Math.max(1, moment(endDate).diff(moment(startDate), 'days') + 1);

    const users = await Users.find({ "role.role": { $ne: "Admin" } }).select("username profileImage");
    const userIds = users.map(u => u._id);

    const referrals = await PatientReferral.find({
      userId: { $in: userIds },
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate("userId", "username profileImage");

    // const bsStart = toBik(from); // ✅ now works properly
    // const [bsYear, bsMonth] = bsStart.split("-").map(Number);
    // const referralMonth = `${nepaliMonthsEnglish[bsMonth]}, ${bsYear}`;

    startDate.setDate(startDate.getDate() - 1); // subtract 1 day
    const nepaliDate = BS.ADToBS(startDate);
    const d1 = nepaliDate.toString().split("-");
    const year = parseInt(d1[0]);
    const month = parseInt(d1[1]);
    const day = parseInt(d1[2]);
    const nepaliMonth = nepaliMonthsEnglish[month];

    const userStats = users.map(user => {
      const userReferrals = referrals.filter(r => r.userId?._id.toString() === user._id.toString());
      const total = userReferrals.length;

      return {
        Username: user.username,
        "Total Referrals": total,
        "Average Referral per Day": +(total / totalDays).toFixed(2),
        "Average Referral per User": +(total / users.length).toFixed(2),
        "Referral Date": `${nepaliMonth}, ${year}`
      };
    });

    const parser = new Parser();
    const csv = parser.parse(userStats);

    res.header("Content-Type", "text/csv");
    res.attachment(`referral_stats_users_${nepaliMonth}_${year}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("Download CSV error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getPatientReferralsByUserId = async (req, res) => {
  try {
    const id = req.params.id;
    const { from, to, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!id || !from || !to) {
      return res.status(400).json({ message: "userId, from, and to dates are required" });
    }

    const filter = {
      userId: id,
      createdAt: { $gte: new Date(from), $lte: new Date(to) }
    };

    const total = await PatientReferral.countDocuments(filter);

    const referrals = await PatientReferral.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profileImage')
      .populate('pocId', 'pocName number category specialization')
      .populate('ambId', 'pocName number ambNumber category specialization');

    res.status(200).json({
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: referrals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientReferralsByPOCOrAmb = async (req, res) => {
  try {
    const id = req.params.id;
    const { type, from, to, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!id || !type || !from || !to) {
      return res.status(400).json({ message: "type (poc/amb), id, from, and to are required" });
    }

    const filter = {
      [type === 'poc' ? 'pocId' : 'ambId']: id,
      createdAt: { $gte: new Date(from), $lte: new Date(to) }
    };

    const total = await PatientReferral.countDocuments(filter);

    const referrals = await PatientReferral.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profileImage')
      .populate('pocId', 'pocName number category specialization')
      .populate('ambId', 'pocName ambNumber category specialization');

    res.status(200).json({
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: referrals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePatientReferral = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await PatientReferral.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: "Patient referral not found" });
    }

    res.status(200).json({
      message: "Referral updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePatientReferral = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PatientReferral.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Patient referral not found" });
    }

    res.status(200).json({ message: "Referral deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { Parser } = require('json2csv');


const downloadCSVByUserId = async (req, res) => {
  try {
    const id = req.params.id;
    const { from, to } = req.query;

    const referrals = await PatientReferral.find({
      userId: id,
      createdAt: { $gte: new Date(from), $lte: new Date(to) }
    })
      .populate('userId', 'username')
      .populate('pocId', 'pocName number category specialization')
      .populate('ambId', 'pocName number category ambNumber');

    const formatted = referrals.map(r => ({
      Username: r.userId?.username || '',
      Date: moment(r.createdAt).tz("Asia/Kathmandu").format("YYYY-MM-DD HH:mm"),
      "Patient Name": r.fullName,
      "POC Name": r.pocId?.pocName || '',
      "POC Number": r.pocId?.number ? `'${r.pocId.number}'` : '',
      Category: r.pocId?.category || r.ambId?.category || '',
      Specialization: r.pocId?.specialization || '',
      "Driver Name": r.ambId?.pocName || '',
      "Driver Number": r.ambId?.number ? `'${r.ambId.number}'` : '',
      "Amb Number": r.ambId?.ambNumber ? r.ambId.ambNumber : ''
    }));

    if (!formatted.length) {
      return res.status(404).json({ message: "No referrals found in the specified date range." });
    }

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.header('Content-Type', 'text/csv');
    res.attachment(`referrals_by_user_${formatted[0].Username || "unknown"}.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const downloadCSVByPOCOrAmb = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, from, to } = req.query;

    const filter = {
      [type === 'poc' ? 'pocId' : 'ambId']: id,
      createdAt: { $gte: new Date(from), $lte: new Date(to) }
    };

    const referrals = await PatientReferral.find(filter)
      .populate('userId', 'username')
      .populate('pocId', 'pocName number category specialization')
      .populate('ambId', 'pocName ambNumber');

    const formatted = referrals.map(r => ({
      Date: moment(r.createdAt).tz("Asia/Kathmandu").format("YYYY-MM-DD HH:mm"),
      "Patient Name": r.fullName,
      Username: r.userId?.username || '',
      "POC Name": r.pocId?.pocName || '',
      "POC Number": r.pocId?.number || '',
      Category: r.pocId?.category || '',
      Specialization: r.pocId?.specialization || '',
      "Driver Name": r.ambId?.pocName || '',
      "Amb Number": r.ambId?.ambNumber || ''
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.header('Content-Type', 'text/csv');
    res.attachment(`referrals_by_${type}_${id}.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReferralById, getReferralByIdAndDate, getReferralByDateCountryRegionAndCity, getReferralByDateCountryAndRegion, getReferralByDateAndCountry, exportCSVData, downloadReferralByDateAndCountryCSV, createPatientReferral,
  getReferralStatsByUsers,
  updateMultipleApprovalStatuses,
  getPatientReferralsByUserId,
  getPatientReferralsByPOCOrAmb,
  updatePatientReferral,
  deletePatientReferral,
  downloadReferralStatsByUsersCSV,
  downloadCSVByUserId,
  downloadCSVByPOCOrAmb, 
};
