const express = require("express");
const router = express.Router();
const { getTodaysPlans, createPlan } = require("../controller/planController");

router.route("/getTodaysPlan").get(getTodaysPlans);
router.route("/").post(createPlan).post();

module.exports = router;
