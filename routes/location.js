const express = require("express");
const router = express.Router();
const {
  deleteAllLocation,
  //   getAllLocation,
  getLocationByID,
  postLocation,
  getLocationFromDate,
} = require("../controller/locationController");

router.route("/delete").delete(deleteAllLocation);
router
  .route("/latest")
  .get(getLocationByID)
  .get(getLocationFromDate)
  .post(postLocation);

module.exports = router;
