const VisitLog = require("../model/visitLog");
const todayDate = require("../config/todayDate");

const todaysVisitLog = async (req, res) => {};

const todaysVisitLogById = async (req, res) => {
  const _id = req.query?.userId;
  const visitDate = todayDate;
  if (!_id) return res.status(400).json({ message: "userId is required" });
  const foundVisitLog = await VisitLog.findById(_id);
  if (!foundVisitLog)
    return res
      .status(404)
      .json({ message: `No visitLog with userId ${_id} found.` });
};
