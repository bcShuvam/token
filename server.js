require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
const PORT = process.env.PORT || 3001;
const cors = require("cors");
const { verifyJWT, verifyRefreshToken } = require("./middleware/verifyJWT");
const getDateRange = require("./utils/getDateRange");
const convertToLocal = require("./utils/convertToLocal");
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

// Example 1: AD monthly (Jan 2025)
console.log(getDateRange({ dateType: "AD", range: "monthly", year: 2025, monthIndex: 0 }));

// Example 2: BS monthly (Baisakh 2082)
console.log(getDateRange({ dateType: "BS", range: "monthly", year: 2082, monthIndex: 0 }));

// Example 3: Custom AD range
console.log(getDateRange({ dateType: "AD", range: "custom", from: "2025-01-10", to: "2025-01-15" }));

// Example 4: Custom BS range
console.log(getDateRange({ dateType: "BS", range: "custom", from: "2082-01-01", to: "2082-01-10" }));

// UTC dates
const fromAD = new Date("2024-12-31T18:15:00.000Z");
const toAD = new Date("2025-01-31T18:14:59.999Z");

// AD output
console.log("AD From:", convertToLocal(fromAD, "AD"));
// -> "00:00 January-01, 2025"
console.log("AD To:", convertToLocal(toAD, "AD"));
// -> "23:59 January-31, 2025"

// BS output (default)
console.log("BS From:", convertToLocal(fromAD));
// -> "00:00 Poush-16, 2081"
console.log("BS To:", convertToLocal(toAD));
// -> "23:59 Magh-17, 2081"



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
