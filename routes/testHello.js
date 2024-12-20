const express = require("express");
const router = express.Router();
const testHello = require("../controller/testHelloController");

router.route("/").get(testHello);

module.exports = router;
