const express = require("express");
const router = express.Router();
const {handleLogin, forgotPassword} = require("../controller/authController");

router.route("/").post(handleLogin);
router.route("/forgot").post(forgotPassword);

module.exports = handleLogin;
