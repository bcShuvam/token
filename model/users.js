const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    profileImage: {type: String, default: "http://res.cloudinary.com/dfpxa2e7r/image/upload/v1742724107/uploads/xrxak1efn47qho6aw4a7.png"},
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Object, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, default: "" },
    address: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    maritalStatus: { type: String, default: "" },
    nationality: { type: String, default: "" },
    doj: { type: Date, required: true },
    isFirstLogin: { type: Boolean, default: true },
    reset: { type: Boolean, default: true },
    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
