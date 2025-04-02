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
          pocReferralCounter: pocDetails.visitCounter,
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


module.exports = { visitLogsList, visitLogsById };
