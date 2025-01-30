const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  getRolesList,
} = require("../controller/userController");

router.route("/").get(getUsers).post(createUser);
router.route("/roles").get(getRolesList);

module.exports = router;
