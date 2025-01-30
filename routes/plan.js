const express = require("express");
const router = express.Router();
const {
  getTodaysPlan,
  getPlans,
  createPlan,
} = require("../controller/planController");

router.route("/today").get(getTodaysPlan);
router.route("/").get(getPlans).post(createPlan);

module.exports = router;
