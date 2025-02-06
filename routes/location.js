const express = require("express");
const router = express.Router();
const {
  deleteAllLocation,
  //   getAllLocation,
  getLocationByID,
  postLocation,
  getLocationFromDate,
} = require("../controllers/locationController");

router.route("/delete").delete(deleteAllLocation);
router
  .route("latest/:id")
  .get(getLocationByID)
  .get(getLocationFromDate)
  .post(postLocation);

module.exports = router;
