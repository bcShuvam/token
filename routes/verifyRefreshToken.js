const express = require("express");
const router = express.Router();
const jwtTokens = require("../middleware/verifyJWT");

router.route("/").post(jwtTokens.verifyRefreshToken);

module.exports = router;
