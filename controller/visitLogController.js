const VisitLog = require("../model/visitLog");

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
    const _id = req.query?.visitLogId;
    if (!_id)
      return res.status(400).json({ message: "visitLogId is required" });
    const from = new Date(req.query?.from);
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(req.query?.to);
    to.setUTCHours(23, 59, 59, 999);
    console.log(req.query?.from);
    console.log(from);
    console.log(req.query?.to);
    console.log(to);
    const foundVisitLog = await VisitLog.findById(_id);
    if (!foundVisitLog)
      return res.status(404).json("message: visitLog not found for given id");
    const filteredVisitLogs = foundVisitLog.visitLogs.filter((logs) => {
      const visitDate = new Date(logs.visitDate); // Convert visitDate to Date object
      return visitDate >= from && visitDate <= to;
    });
    if (filteredVisitLogs.length === 0)
      return res.status(404).json({
        message: `No visitLog found from ${from.toISOString()} to ${to.toISOString()}.`,
        visitLogs: {},
      });
    const visitLogs = {
      _id: foundVisitLog._id,
      username: foundVisitLog.username,
      visitLogCounter: foundVisitLog.visitLogCounter,
      visitLogs: filteredVisitLogs,
    };
    // const visitLogs = foundVisitLog;
    console.log(visitLogs);
    res.status(200).json({ message: "success", visitLogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { visitLogsList, visitLogsById };
