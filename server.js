require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
const PORT = process.env.PORT || 3001;
const cors = require("cors");
const getMonthRange = require('./utils/fromAndToBs');
const {convertToNepaliDateTime, convertBsRangeToAd} = require('./utils/adToBs');
const { verifyJWT, verifyRefreshToken } = require("./middleware/verifyJWT");
// connect the mongodb
connectDB();

// Add this line after main: server.js line on package.json file
// "type": "module", to use import

var admin = require("firebase-admin");
var serviceAccount = require("./firebaseAdmin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// built-in middleware to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

// middleware for cors
app.use(cors({ origin: "*" }));

// built-in middleware for json
app.use(express.json());
// console.log(ROLES_LIST);

// // middleware for cookie-parser
// app.use(cookieParser());

let { fromBS, toBS } = getMonthRange('2082-04', '2082-04');
fromBS = fromBS.format('YYYY-MM-DD').toString()
toBS = toBS.format('YYYY-MM-DD').toString()
console.log(`From = ${fromBS}`);
console.log(`To   = ${toBS}`);

let { fromAD, toAD } = convertBsRangeToAd(fromBS, toBS);
console.log("FromD =", fromAD);
console.log("ToD   =", toAD);

// const { from, to } = convertBsRangeToAd("2082-04-01", "2082-04-31");
// console.log("From =", from);
// console.log("To   =", to);

// routes
app.use("/api/notification", require("./routes/notificationRoutes"));

app.use("/api/img", require("./routes/uploadImage"));
app.use("/api/refreshToken", require("./routes/verifyRefreshToken"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/mail", require("./routes/sendMail"));
app.use("/api/hello", require("./routes/testHello"));
app.use("/api/location", require("./routes/location"));
app.use(verifyJWT);
app.use("/api/users", require("./routes/users"));
app.use("/api/visitLogs", require("./routes/visitLog"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/poc", require("./routes/poc"));
app.use("/api/plan", require("./routes/plan"));
app.use("/api/patient-referral", require("./routes/referral"));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB...");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
