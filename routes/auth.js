const express = require("express");
const router = express.Router();
const handleLogin = require("../controller/authController");

router.route("/").post(handleLogin);

module.exports = handleLogin;
