const Users = require("../model/users");
const jwt = require("jsonwebtoken");

const handleLogout = async (req, res) => {
  try {
    const _id = req.body;
    const foundUser = await Users.findById(_id);
    if (!foundUser) return res.status(404).json({ message: "User not found" });
    foundUser.refreshToken = "";
    foundUser.refreshToken = "";
    foundUser.save();
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = handleLogout;
