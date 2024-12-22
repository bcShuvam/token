require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require("cors");

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
