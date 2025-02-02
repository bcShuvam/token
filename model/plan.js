const mongoose = require("mongoose");

const visitPlanModel = new mongoose.Schema(
  {
    activity: { type: String, required: true },
    area: { type: String, required: true },
    remark: { type: String, required: true },
    planDate: { type: String, required: true },
    mobileTime: { type: String, required: true },
  },
  { timestamps: true }
);

const planModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: { type: String, required: true },
    area: { type: String, required: true },
    remark: { type: String, required: true },
    planDate: { type: Date, required: true },
    mobileTime: { type: String, required: true },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planModel);

module.exports = Plan;
