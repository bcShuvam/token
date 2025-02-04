require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
const PORT = process.env.PORT || 3001;
const cors = require("cors");
const { verifyJWT, verifyRefreshToken } = require("./middleware/verifyJWT");
// connect the mongodb
connectDB();

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

// routes
app.use("/api/hello", require("./routes/testHello"));
app.use("/api/refreshToken", require("./routes/verifyRefreshToken"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use(verifyJWT);
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/poc", require("./routes/poc"));
app.use("/api/visitLogs", require("./routes/visitLog"));
app.use("/api/referral", require("./routes/referral"));
app.use("/api/plan", require("./routes/plan"));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB...");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
