const express = require("express");
const router = express.Router();
const getUsers = require("../controller/userController");

router.route("/").get(getUsers);

module.exports = router;
