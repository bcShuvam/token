const VisitLog = require("../model/visitLog");
const POC = require("../model/poc");
const { Parser } = require('json2csv');
const {AdToBsDatetime} = require('../utils/ad_to_bs_utils');
const AdToBsDate = require('../utils/date_ad_to_bs_utils');
const User = require('../model/users');

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

    const formattedFrom = from.toISOString().split("T")[0];
    const formattedTo = to.toISOString().split("T")[0];

    const numberOfDays = Math.max(
      1,
      Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const userRows = [];

    allVisitLogs.forEach((user, index) => {
      const filteredLogs = user.visitLogs.filter((log) => {
        if (!log.mobileTime) return false;
        const [timePart, datePart] = log.mobileTime.split(" ");
        const logDate = new Date(`${datePart}T${timePart}Z`);
        return logDate >= from && logDate <= to;
      });

      let userNewVisit = 0;
      let userFollowUpVisit = 0;

      filteredLogs.forEach((log) => {
        if (log.visitType === "New") userNewVisit++;
        else if (log.visitType === "Follow Up") userFollowUpVisit++;
      });

      const userTotalVisits = filteredLogs.length;

      userRows.push({
        Sn: index + 1,
        Name: user.username,
        From: formattedFrom,
        To: formattedTo,
        "Total Visits": userTotalVisits,
        "Average Visits": parseFloat(
          (userTotalVisits / numberOfDays).toFixed(2)
        ),
        "New Visits": userNewVisit,
        "Average New Visits": parseFloat(
          (userNewVisit / numberOfDays).toFixed(2)
        ),
        "FollowUp Visits": userFollowUpVisit,
        "Average FollowUp Visits": parseFloat(
          (userFollowUpVisit / numberOfDays).toFixed(2)
        ),
      });
    });

    const csvFields = [
      "Sn",
      "Name",
      "From",
      "To",
      "Total Visits",
      "Average Visits",
      "New Visits",
      "Average New Visits",
      "FollowUp Visits",
      "Average FollowUp Visits",
    ];

    const parser = new Parser({ fields: csvFields });
    const csv = parser.parse(userRows);

    const fileName = `Average Visit ${formattedFrom} to ${formattedTo}.csv`;
    res.header("Content-Type", "text/csv");
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

    // ✅ populate pocId inside visitLogs
    const foundVisitLog = await VisitLog.findById(_id).populate("visitLogs.pocId");
    const foundUser = await User.findById(_id);

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

    // ✅ use populated pocId fields directly
    const formattedFilteredVisitLogs = filteredVisitLogs.map((log) => {
      const poc = log.pocId; // populated POC doc
      return {
        pocAddress: `${poc.country}, ${poc.region}, ${poc.city}, ${poc.address}`,
        pocVisitCounter: poc.visitCounter,
        pocReferralCounter: poc.referralCounter,
        pocNumber: poc.number,
        pocCategory: poc.category,
        pocGender: poc.gender,
        pocSpecialization: poc.specialization,
        ambNumber: poc.ambNumber,
        pocReferral: poc.referralCounter,
        pocId: poc._id,
        pocName: log.pocName,
        remarks: log.remarks,
        mobileTime: log.mobileTime,
        visitDate: AdToBsDatetime(log.visitDate).bs,
        visitType: log.visitType,
        latitude: log.latitude,
        longitude: log.longitude,
        logId: log._id,
        approvalStatus: log.approvalStatus,
      };
    });

    const visitLogs = {
      _id: foundVisitLog._id,
      username: foundVisitLog.username,
      profileImage: foundUser?.profileImage || null,
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
      return res.status(400).json({ message: "userId, from, and to are required" });
    }

    const foundVisitLog = await VisitLog.findById(userId).populate("visitLogs.pocId");
    if (!foundVisitLog) {
      return res.status(404).json({ message: "User not found", logs: [] });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Filter logs within date range
    const filteredLogs = foundVisitLog.visitLogs.filter((log) => {
      const visitDate = new Date(log.visitDate);
      return visitDate >= fromDate && visitDate <= toDate;
    });

    // 🔹 Remap logs to flatten pocId into a string & merge fields
    const remappedLogs = filteredLogs.map((log) => {
      const poc = log.pocId && typeof log.pocId === "object" ? log.pocId : null;

      return {
        ...log.toObject(),
        pocId: poc ? poc._id : log.pocId, // keep as string
        pocName: poc ? poc.pocName : log.pocName, // override with POC data if available
        gender: poc ? poc.gender : undefined,
        number: poc ? poc.number : undefined,
        country: poc ? poc.country : undefined,
        region: poc ? poc.region : undefined,
        city: poc ? poc.city : undefined,
        address: poc ? poc.address : undefined,
        category: poc ? poc.category : undefined,
        specialization: poc ? poc.specialization : undefined,
        organization: poc ? poc.organization : undefined,
        ambNumber: poc ? poc.ambNumber : undefined,
      };
    });

    // Calculate stats
    const timeDiff = Math.abs(toDate - fromDate);
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // include both dates
    const totalVisits = remappedLogs.length;
    const averagePerDay = totalVisits / days;

    return res.status(200).json({
      message: "Average visits calculated",
      totalVisits,
      days,
      averagePerDay: averagePerDay.toFixed(2),
      logs: remappedLogs,
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
        message: "userId, pocId, from and to are required",
      });
    }

    const foundVisitLog = await VisitLog.findById(userId).populate(
      "visitLogs.pocId"
    );
    if (!foundVisitLog) {
      return res.status(404).json({
        message: "User not found",
        logs: [],
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Filter the logs
    const filteredLogs = foundVisitLog.visitLogs.filter((log) => {
      const visitDate = new Date(log.visitDate);
      return (
        log.pocId && String(log.pocId._id) === String(pocId) &&
        visitDate >= fromDate &&
        visitDate <= toDate
      );
    });

    return res.status(200).json({
      message: "Filtered visit logs retrieved",
      logs: filteredLogs, // ✅ unchanged format
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
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

    // ✅ populate pocId
    const foundVisitLog = await VisitLog.findById(_id).populate(
      "visitLogs.pocId"
    );
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

    const formattedFilteredVisitLogs = filteredVisitLogs.map((log, index) => {
      const pocDetails = log.pocId; // ✅ already populated
      return {
        SN: index + 1,
        username: foundVisitLog.username,
        pocName: log.pocName,
        mobileTime: AdToBsDatetime(log.createdAt).bs,
        pocNumber: pocDetails
          ? `="${pocDetails.number}"`
          : "",
        pocCategory: pocDetails ? pocDetails.category : "",
        pocSpecialization: pocDetails ? pocDetails.specialization : "",
        pocAddress: pocDetails
          ? `${pocDetails.country}, ${pocDetails.region}, ${pocDetails.city}, ${pocDetails.address}`
          : "",
        visitType: log.visitType,
        pocVisitCounter: pocDetails ? pocDetails.visitCounter : 0,
        pocReferralCounter: pocDetails ? pocDetails.referralCounter : 0,
        ambNumber: pocDetails ? pocDetails.ambNumber : "",
        remarks: log.remarks,
        approvalStatus: log.approvalStatus,
      };
    });

    const fields = [
      { label: "SN", value: "SN" },
      { label: "Name", value: "username" },
      { label: "Visit Time", value: "mobileTime" },
      { label: "POC Name", value: "pocName" },
      { label: "Number", value: "pocNumber" },
      { label: "Category", value: "pocCategory" },
      { label: "Specialization", value: "pocSpecialization" },
      { label: "Address", value: "pocAddress" },
      { label: "Visit Type", value: "visitType" },
      { label: "Visit Counter", value: "pocVisitCounter" },
      { label: "Referral Counter", value: "pocReferralCounter" },
      { label: "Ambulance Number", value: "ambNumber" },
      { label: "Remarks", value: "remarks" },
      { label: "Status", value: "approvalStatus" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(formattedFilteredVisitLogs);

    const usernameSafe = foundVisitLog.username.replace(/ /g, "_");
    const filename = `${usernameSafe}_visitlogs_${AdToBsDate(
      req.query.from
    )}_${AdToBsDate(req.query.to)}.csv`;

    res.header("Content-Type", "text/csv");
    res.attachment(filename);

    return res.status(200).send(csv);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { downloadVisitLogsById, getTodaysAverageVisitOfAll, exportAverageVisitCSV, visitLogsList, visitLogsById, updateReferralLogStatus, averageVisit, getPocVisitLog };
