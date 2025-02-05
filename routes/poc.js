const express = require("express");
const router = express.Router();
const {
  getPOCs,
  getPOCByCreatedByIdAndCategory,
  getPocCreatedById,
  createPOC,
  pocFollowUp,
} = require("../controller/pocController");

router.route("").get(getPOCs);
router.route("/category").get(getPOCByCreatedByIdAndCategory);
router.route("/createdBy").get(getPocCreatedById);
router.route("/create").post(createPOC);
router.route("/followup").post(pocFollowUp);
module.exports = router;
