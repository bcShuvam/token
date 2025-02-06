const express = require("express");
const router = express.Router();
const {
  deleteAllLocation,
  //   getAllLocation,
  getLocationByID,
  postLocation,
  getLocationFromDate,
} = require("../controllers/locationController");

router
  .route("/location")
  .get(getLocationFromDate)
  .post(postLocation)
  .delete(deleteAllLocation);
router.route("/location/:id").get(getLocationByID);

module.exports = router;
