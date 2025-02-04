const VisitLog = require("../model/visitLog");

const visitLogsById = async (req, res) => {
  try {
    const _id = req.query?.visitLogId;
    if (!_id)
      return res.status(400).json({ message: "visitLogId is required" });
    const from = new Date(req.query?.from);
    const to = new Date(req.query?.to);
    console.log(from);
    console.log(to);
    const foundVisitLog = await VisitLog.findOne({
      _id,
      visitLogs: {
        $elemMatch: {
          createdAt: { $gte: from, $lte: to },
        },
      },
    });
    if (!foundVisitLog)
      return res
        .status(404)
        .json({ message: `No visitLog with userId ${_id} found.` });
    const visitLogs = foundVisitLog;
    console.log(visitLogs);
    res.status(200).json({ message: "success", visitLogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = visitLogsById;
