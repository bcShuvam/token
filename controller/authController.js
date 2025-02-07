const Users = require("../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email and password are required" });
    let foundUser = await Users.findOne({ email });
    if (!foundUser)
      return res.status(404).json({ message: "Incorrect email or password" });
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });
    if (foundUser.isFirstLogin || foundUser.reset) {
      const updatedUser = await Users.findOneAndUpdate(
        { email },
        { $set: { isFirstLogin: false, reset: false } }
      );
      foundUser = await Users.findOne({ email });
      const formattedUserDetail = {
        _id: foundUser?._id,
        username: foundUser?.username,
        role: foundUser?.role,
        department: foundUser?.department,
        designation: foundUser?.designation,
        email: foundUser?.email,
        number: foundUser?.number,
        address: foundUser?.address,
        dob: foundUser?.dob,
        gender: foundUser?.gender,
        maritalStatus: foundUser?.maritalStatus,
        nationality: foundUser?.nationality,
        doj: foundUser?.doj,
        isFirstLogin: foundUser?.isFirstLogin,
        reset: foundUser?.reset,
      };
      const accessToken = jwt.sign(
        { formattedUserDetail },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      const refreshToken = jwt.sign(
        { formattedUserDetail },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      foundUser.accessToken = accessToken;
      foundUser.refreshToken = refreshToken;
      foundUser.save();
      res.status(200).json({
        message: "Login successful",
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: formattedUserDetail,
      });
    } else {
      const formattedUserDetail = {
        _id: foundUser?._id,
        username: foundUser?.username,
        role: foundUser?.role,
        department: foundUser?.department,
        designation: foundUser?.designation,
        email: foundUser?.email,
        number: foundUser?.number,
        address: foundUser?.address,
        dob: foundUser?.dob,
        gender: foundUser?.gender,
        maritalStatus: foundUser?.maritalStatus,
        nationality: foundUser?.nationality,
        doj: foundUser?.doj,
        isFirstLogin: foundUser?.isFirstLogin,
        reset: foundUser?.reset,
      };
      const accessToken = jwt.sign(
        { formattedUserDetail },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2m" }
      );
      const refreshToken = jwt.sign(
        { formattedUserDetail },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      foundUser.accessToken = accessToken;
      foundUser.refreshToken = refreshToken;
      foundUser.save();
      res.status(200).json({
        message: "Login successful",
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: formattedUserDetail,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = handleLogin;
