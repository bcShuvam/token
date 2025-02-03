const Plan = require("../model/plan");
const todayDate = require("../config/todayDate");

const getTodaysPlan = async (req, res) => {
  try {
    const userId = req.query.userId;
    const planDate = todayDate;
    console.log(planDate);

    if (!userId) return res.status(400).json({ message: "userId is required" });
    const todaysPlan = await Plan.findOne({
      userId,
      planDate,
    });
    console.log(todaysPlan);

    if (!todaysPlan)
      return res
        .status(404)
        .json({
          message: `no plan found for today ${
            planDate.toISOString().split("T")[0]
          }`,
        });

    res.status(200).json({ message: "Success", todaysPlan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const userId = req.query.userId;
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    console.log(from);
    console.log(to);
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
