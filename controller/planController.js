const Plan = require("../model/plan");

const getTodaysPlan = async (req, res) => {
  try {
    const userId = req.query.userId;
    const date = new Date();
    const offset = 5 * 60 + 45; // 5 hours 45 minutes in minutes
    const adjustedDate = new Date(date.getTime() + offset * 60000);
    const planDate = adjustedDate.toISOString().split("T")[0];

    if (!userId) return res.status(400).json({ message: "userId is required" });
    const todaysPlan = await Plan.find({
      userId,
      planDate,
    });

    if (!todaysPlan)
      return res
        .status(404)
        .json({ message: `no plan found for today ${planDate}` });

    res.status(200).json({ message: "Success", todaysPlan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const userId = req.query.userId;
    const date = new Date();
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    console.log(req.query.from);
    console.log(`From = ${from.toISOString()}`);
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const todaysPlan = await Plan.find({
      userId,
      planDate: { $gte: from, $lte: to }, // Find plans within the range
    });
    res.status(200).json({ message: "Success", todaysPlan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const { userId, activity, area, remark, planDate, mobileTime } = req.body;
    if (!userId || !area || !remark || !planDate || !mobileTime)
      return res.status(400).json({
        message:
          "userId, activity, area, remark, planDate and mobileTime are required",
      });

    const foundPlan = await Plan.findOne({
      planDate: planDate,
      userId: userId,
    });
    console.log(foundPlan);
    if (foundPlan)
      return res
        .status(200)
        .json({ message: `Plan already exists for ${planDate}` });

    const newPlan = await Plan.create({
      userId,
      activity,
      area,
      remark,
      mobileTime,
      planDate,
    });
    res.status(200).json({ message: "Success", newPlan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTodaysPlan, getPlans, createPlan };
