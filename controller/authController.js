const Users = require("../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "deskgoo2024@gmail.com",
        pass: "hauevnqxexvmoptg", // App password
    },
});

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
        profileImage: foundUser?.profileImage,
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
        profileImage: foundUser?.profileImage,
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
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });
    let foundUser = await Users.findOne({ email });

    if (!foundUser)
      return res.status(404).json({ message: "Incorrect email" });

    if (!password || !confirmPassword)
      return res
        .status(400)
        .json({ message: "password and confirm password are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    foundUser.password = await bcrypt.hash(password, 10);

    foundUser.save();

    await transporter.sendMail({
            from: "deskgoo2024@gmail.com",
            to: email,
            subject: "Welcome to Deskgoo Track",
            text: `Hello ${foundUser.username},

        We are from Deskgoo Track App!

        Your account password has been successfully changed. You can now use your new password to log in using the credentials below:

        📧 Email: ${email}
        🔐 Password: ${password}

        📱 Download the Deskgoo Track app: 
        - Android (Play Store): 

        If you have any questions, feel free to reach out.

        Best regards,  
        Deskgoo Track Team`,
        });

    res.status(200).json({
      message: "Password Changed Successfully. An email has been sent to your email",
      // password: password
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {handleLogin, forgotPassword};
