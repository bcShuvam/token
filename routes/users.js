const express = require("express");
const router = express.Router();
const {verifyRole} = require('../middleware/verifyRoles');
const {
  getUsers,
  createUser,
  getRolesList,
} = require("../controller/userController");

router.route("/").get(verifyRole('Admin'),getUsers).post(createUser);
router.route("/roles").get(getRolesList);

module.exports = router;
