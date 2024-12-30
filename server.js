require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
const PORT = process.env.PORT || 3001;
const cors = require("cors");

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

// // middleware for cookie-parser
// app.use(cookieParser());

// routes
app.use("/hello", require("./routes/testHello"));
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/attendance", require("./routes/attendance"));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB...");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
