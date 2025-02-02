const express = require("express");
const router = express.Router();
const {
  getPOCs,
  getPocCreatedById,
  createPOC,
  pocFollowUp,
} = require("../controller/pocController");

router.route("").get(getPOCs);
router.route("/createdBy").get(getPocCreatedById);
router.route("/create").post(createPOC);
router.route("/followup").post(pocFollowUp);
module.exports = router;
