const VisitLog = require("../model/visitLog");
const POC = require("../model/poc");

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



module.exports = { visitLogsList, visitLogsById, updateReferralLogStatus, averageVisit,getPocVisitLog };
