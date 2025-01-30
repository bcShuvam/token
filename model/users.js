const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: Object,
      default: { User: 3030 },
    },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, default: "" },
    number: { type: Number, default: "" },
    address: { type: String, default: "" },
    dob: { type: String, default: "" },
    isFirstLogin: { type: Boolean, default: true },
    reset: { type: Boolean, default: true },
    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
