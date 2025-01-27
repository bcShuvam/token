const Plan = require("../model/plan");

const getTodaysPlans = async (req, res) => {
  try {
    const userId = req.query.userId;
    let date = new Date();
    let localDate = date.toUTCString();
    localDate = Date(localDate + " UTC");
    const ymd = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    console.log(localDate);
    const planDate = req.query.planDate;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const todaysPlan = await Plan.find({ userId, planDate });
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

module.exports = { getTodaysPlans, createPlan };
