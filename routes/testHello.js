const express = require("express");
const router = express.Router();


const {testHello, generateRegistrationForm} = require("../controller/testHelloController");

router.route("/").get(testHello);
router.route("/form").get(generateRegistrationForm);

module.exports = router;
