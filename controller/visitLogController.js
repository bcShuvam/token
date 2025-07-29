const VisitLog = require("../model/visitLog");
const POC = require("../model/poc");
const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

const getTodaysAverageVisitOfAll = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    if (!from || isNaN(from)) {
      return res.status(400).json({ message: "Invalid or missing 'from' date" });
    }
    if (!to || isNaN(to)) {
      return res.status(400).json({ message: "Invalid or missing 'to' date" });
    }

    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    const allVisitLogs = await VisitLog.find();

    let totalVisitCount = 0;
    let totalNewVisit = 0;
    let totalFollowUpVisit = 0;

    const numberOfDays = Math.max(
      1,
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const filteredUsers = allVisitLogs.map(user => {
      const filteredLogs = user.visitLogs.filter(log => {
        if (!log.mobileTime) return false;
        const [timePart, datePart] = log.mobileTime.split(' ');
        const logDate = new Date(`${datePart}T${timePart}Z`);
        return logDate >= from && logDate <= to;
      });

      let userNewVisit = 0;
      let userFollowUpVisit = 0;

      filteredLogs.forEach(log => {
        if (log.visitType === "New") userNewVisit++;
        else if (log.visitType === "Follow Up") userFollowUpVisit++;
      });

      const userTotalVisits = filteredLogs.length;
      totalVisitCount += userTotalVisits;
      totalNewVisit += userNewVisit;
      totalFollowUpVisit += userFollowUpVisit;

      return {
        _id: user._id,
        username: user.username,
        totalVisits: userTotalVisits,
        averageVisit: parseFloat((userTotalVisits / numberOfDays).toFixed(2)),
        totalNewVisit: userNewVisit,
        totalFollowUpVisit: userFollowUpVisit,
      };
    });

    const userCount = filteredUsers.length;
    const averageVisit = userCount > 0 ? totalVisitCount / userCount : 0;
    const averageNewVisit = userCount > 0 ? totalNewVisit / userCount : 0;
    const averageFollowUpVisit = userCount > 0 ? totalFollowUpVisit / userCount : 0;
    const totalAverageVisits = totalVisitCount / numberOfDays;

    res.status(200).json({
      message: "success",
      totalVisits: totalVisitCount,
      totalAverageVisits: parseFloat(totalAverageVisits.toFixed(2)),
      averageVisit,
      totalNewVisit,
      averageNewVisit,
      totalFollowUpVisit,
      averageFollowUpVisit,
      users: filteredUsers
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const exportAverageVisitCSV = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    if (!from || isNaN(from)) {
      return res.status(400).json({ message: "Invalid or missing 'from' date" });
    }
    if (!to || isNaN(to)) {
      return res.status(400).json({ message: "Invalid or missing 'to' date" });
    }

    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    const allVisitLogs = await VisitLog.find();

    const formattedFrom = from.toISOString().split('T')[0];
    const formattedTo = to.toISOString().split('T')[0];

    const numberOfDays = Math.max(
      1,
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const userRows = [];

    allVisitLogs.forEach((user, index) => {
      const filteredLogs = user.visitLogs.filter(log => {
        if (!log.mobileTime) return false;
        const [timePart, datePart] = log.mobileTime.split(' ');
        const logDate = new Date(`${datePart}T${timePart}Z`);
        return logDate >= from && logDate <= to;
      });

      let userNewVisit = 0;
      let userFollowUpVisit = 0;

      filteredLogs.forEach(log => {
        if (log.visitType === "New") userNewVisit++;
        else if (log.visitType === "Follow Up") userFollowUpVisit++;
      });

      const userTotalVisits = filteredLogs.length;

      userRows.push({
        Sn: index + 1,
        Name: user.username,
        From: formattedFrom,
        To: formattedTo,
        'Total Visits': userTotalVisits,
        'Average Visits': parseFloat((userTotalVisits / numberOfDays).toFixed(2)),
        'New Visits': userNewVisit,
        'Average New Visits': parseFloat((userNewVisit / numberOfDays).toFixed(2)),
        'FollowUp Visits': userFollowUpVisit,
        'Average FollowUp Visits': parseFloat((userFollowUpVisit / numberOfDays).toFixed(2))
      });
    });

    const csvFields = [
      'Sn',
      'Name',
      'From',
      'To',
      'Total Visits',
      'Average Visits',
      'New Visits',
      'Average New Visits',
      'FollowUp Visits',
      'Average FollowUp Visits'
    ];

    const parser = new Parser({ fields: csvFields });
    const csv = parser.parse(userRows);

    const fileName = `Average Visit ${formattedFrom} to ${formattedTo}.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const visitLogsList = async (req, res) => {
  try {
    const _id = req.query;
    if (!_id) return res.status(400).json({ message: "_id is required" });

    const foundVisitLog = await VisitLog.find();
    if (!foundVisitLog)
      return res.status(404).json({ message: "No visit log found", logs: [] });

    const formattedVisitLogs = foundVisitLog.map((logs) => ({
      _id: logs?._id,
      username: logs?.username,
    }));
    console.log(formattedVisitLogs);
    res.status(200).json({ message: "success", logs: formattedVisitLogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const visitLogsById = async (req, res) => {
  try {
    const _id = req.query.visitLogId;
    if (!_id) {
      return res.status(400).json({ message: "visitLogId is required" });
    }

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    if (!from || isNaN(from)) {
      return res.status(400).json({ message: "Invalid or missing 'from' date" });
    }
    if (!to || isNaN(to)) {
      return res.status(400).json({ message: "Invalid or missing 'to' date" });
    }

    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    console.log("From:", from, "To:", to);

    const foundVisitLog = await VisitLog.findById(_id);
    if (!foundVisitLog) {
      return res.status(404).json({ message: "VisitLog not found for given id" });
    }

    const filteredVisitLogs = foundVisitLog.visitLogs.filter((log) => {
      const visitDate = new Date(log.visitDate);
      return visitDate >= from && visitDate <= to;
    });

    if (filteredVisitLogs.length === 0) {
      return res.status(404).json({
        message: `No visitLog found from ${from.toISOString()} to ${to.toISOString()}.`,
        visitLogs: [],
      });
    }

    // Fetch POC details for each visit log concurrently
    const formattedFilteredVisitLogs = await Promise.all(
      filteredVisitLogs.map(async (log) => {
        const pocDetails = await POC.findById(log.pocId);
        return {
          pocAddress: `${pocDetails.country}, ${pocDetails.region}, ${pocDetails.city}, ${pocDetails.address}`,
          pocVisitCounter: pocDetails.visitCounter,
          pocReferralCounter: pocDetails.referralCounter,
          pocNumber: pocDetails.number,
          pocCategory: pocDetails.category,
          pocGender: pocDetails.gender,
          pocSpecialization: pocDetails.specialization,
          ambNumber: pocDetails.ambNumber,
          pocReferral: pocDetails.referralCounter,
          pocId: log.pocId,
          pocName: log.pocName,
          remarks: log.remarks,
          mobileTime: log.mobileTime,
          visitDate: log.visitDate,
          visitType: log.visitType,
          latitude: log.latitude,
          longitude: log.longitude,
          logId: log._id,
          approvalStatus: log.approvalStatus,
        };
      })
    );

    const visitLogs = {
      _id: foundVisitLog._id,
      username: foundVisitLog.username,
      visitLogCounter: foundVisitLog.visitLogCounter,
      visitLogs: formattedFilteredVisitLogs,
    };

    console.log("Response:", visitLogs);
    res.status(200).json({ message: "success", visitLogs });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getVisitByDateCountryRegionAndCity = async (req, res) => {
  try {
    const { _id, from, to, country, region, city } = req.query;
    if (!_id) return res.status(400).json({ message: "_id is required" });
    if (!from || !to || !country || !region || !city)
      return res.status(400).json({ message: "from, to and country, region and city are required" });

    const visitDateFrom = new Date(from);
    visitDateFrom.setUTCHours(0, 0, 0, 0);
    const visitDateTo = new Date(to);
    visitDateTo.setUTCHours(23, 59, 59, 999);

    const foundVisitLog = await VisitLog.findById(_id);
    if (!foundVisitLog)
      return res.status(404).json({ message: "no referral found", referralLogs: {} });

    let filteredVisitLogs = foundVisitLog.visitLogs.filter((logs) => {
      const date = new Date(logs.visitDate);
      return date >= visitDateFrom && date <= visitDateTo;
    });

    let formattedVisitData = [];

    if (filteredVisitLogs.length !== 0) {
      for (const logs of filteredVisitLogs) {
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

const getVisitByDateCountryAndRegion = async (req, res) => {
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

const getVisitByDateAndCountry = async (req, res) => {
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

const updateReferralLogStatus = async (req, res) => {
  try {
    const logs = req.body; // Expecting an array of objects with _id (logId) and approvalStatus

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Update each nested visit log by _id
    const updatePromises = logs.map(log =>
      VisitLog.updateOne(
        { "visitLogs._id": log._id }, // Find the document containing the nested log by its _id
        { $set: { "visitLogs.$.approvalStatus": log.approvalStatus } } // Update approvalStatus for the matched visitLog
      )
    );

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Logs updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

const averageVisit = async (req, res) => {
  try {
    const { userId, from, to } = req.query;

    if (!userId || !from || !to) {
      return res.status(400).json({ message: 'userId, from, and to are required' });
    }

    const foundVisitLog = await VisitLog.findById(userId);
    if (!foundVisitLog) {
      return res.status(404).json({ message: "User not found", logs: [] });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const filteredLogs = foundVisitLog.visitLogs.filter(log => {
      const visitDate = new Date(log.visitDate);
      return visitDate >= fromDate && visitDate <= toDate;
    });

    const timeDiff = Math.abs(toDate - fromDate);
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // including both dates
    const totalVisits = filteredLogs.length;
    const averagePerDay = totalVisits / days;

    return res.status(200).json({
      message: "Average visits calculated",
      totalVisits,
      days,
      averagePerDay: averagePerDay.toFixed(2),
      logs: filteredLogs,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPocVisitLog = async (req, res) => {
  try {
    const { userId, pocId, from, to } = req.query;

    // Validation
    if (!userId || !pocId || !from || !to) {
      return res.status(400).json({
        message: 'userId, pocId, from and to are required'
      });
    }

    const foundVisitLog = await VisitLog.findById(userId);
    if (!foundVisitLog) {
      return res.status(404).json({
        message: 'User not found',
        logs: []
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Filter the logs
    const filteredLogs = foundVisitLog.visitLogs.filter((log) => {
      const visitDate = new Date(log.visitDate);
      return (
        log.pocId === pocId &&
        visitDate >= fromDate &&
        visitDate <= toDate
      );
    });

    return res.status(200).json({
      message: 'Filtered visit logs retrieved',
      logs: filteredLogs
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

const downloadVisitLogsById = async (req, res) => {
  try {
    const _id = req.query.visitLogId;
    if (!_id) {
      return res.status(400).json({ message: "visitLogId is required" });
    }

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    if (!from || isNaN(from)) {
      return res.status(400).json({ message: "Invalid or missing 'from' date" });
    }
    if (!to || isNaN(to)) {
      return res.status(400).json({ message: "Invalid or missing 'to' date" });
    }

    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    const foundVisitLog = await VisitLog.findById(_id);
    if (!foundVisitLog) {
      return res.status(404).json({ message: "VisitLog not found for given id" });
    }

    const filteredVisitLogs = foundVisitLog.visitLogs.filter((log) => {
      const visitDate = new Date(log.visitDate);
      return visitDate >= from && visitDate <= to;
    });

    if (filteredVisitLogs.length === 0) {
      return res.status(404).json({
        message: `No visitLog found from ${from.toISOString()} to ${to.toISOString()}.`,
        visitLogs: [],
      });
    }

    const formattedFilteredVisitLogs = await Promise.all(
      filteredVisitLogs.map(async (log, index) => {
        const pocDetails = await POC.findById(log.pocId);
        return {
          SN: index + 1,
          username: foundVisitLog.username,
          pocName: log.pocName,
          pocNumber: `="${pocDetails.number}"`,
          pocCategory: pocDetails.category,
          pocSpecialization: pocDetails.specialization,
          pocAddress: `${pocDetails.country}, ${pocDetails.region}, ${pocDetails.city}, ${pocDetails.address}`,
          visitType: log.visitType,
          pocVisitCounter: pocDetails.visitCounter,
          pocReferralCounter: pocDetails.referralCounter,
          ambNumber: pocDetails.ambNumber,
          mobileTime: log.mobileTime,
          remarks: log.remarks,
          approvalStatus: log.approvalStatus,
        };
      })
    );

    const fields = [
      { label: 'SN', value: 'SN' },
      { label: 'Name', value: 'username' },
      { label: 'POC Name', value: 'pocName' },
      { label: 'Number', value: 'pocNumber' },
      { label: 'Category', value: 'pocCategory' },
      { label: 'Specialization', value: 'pocSpecialization' },
      { label: 'Address', value: 'pocAddress' },
      { label: 'Visit Type', value: 'visitType' },
      { label: 'Visit Counter', value: 'pocVisitCounter' },
      { label: 'Referral Counter', value: 'pocReferralCounter' },
      { label: 'Ambulance Number', value: 'ambNumber' },
      { label: 'Visit Time', value: 'mobileTime' },
      { label: 'Remarks', value: 'remarks' },
      { label: 'Status', value: 'approvalStatus' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(formattedFilteredVisitLogs);

    const usernameSafe = foundVisitLog.username.replace(/ /g, '_');
    const filename = `${usernameSafe}_visitlogs_${req.query.from}_${req.query.to}.csv`;

    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    return res.send(csv);

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { downloadVisitLogsById, getTodaysAverageVisitOfAll, exportAverageVisitCSV, visitLogsList, visitLogsById, updateReferralLogStatus, averageVisit, getPocVisitLog };
