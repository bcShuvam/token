const express = require("express");
const router = express.Router();
const {
  getPOCs,
  getPOCById,
  getPOCByCreatedByIdAndCategory,
  getPocCreatedById,
  getPocCreatedByIdWithPagination,
  createPOC,
  pocFollowUp,
  updatePOCById,
  pocByArea,
} = require("../controller/pocController");

router.route("/").get(getPOCs);
router.route("/:id").get(getPOCs);
router.route("/category").get(getPOCByCreatedByIdAndCategory);
router.route("/createdBy").get(getPocCreatedById);
router.route("/createdUserId/:id").get(getPocCreatedByIdWithPagination);
router.route("/create").post(createPOC);
router.route("/followup").post(pocFollowUp);
router.route("/update/:id").patch(updatePOCById);
router.route("/area").get(pocByArea);
module.exports = router;
