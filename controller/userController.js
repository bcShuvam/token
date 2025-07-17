const User = require("../model/users");
const Attendance = require("../model/attendance");
const VisitLog = require("../model/visitLog");
const Referral = require("../model/referral");
const Location = require("../model/location");
const Plan = require("../model/plan");
const bcrypt = require("bcrypt");
const ROLES_LIST = require("../config/roles_list");
const nodemailer = require("nodemailer");

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "deskgoo2024@gmail.com",
        pass: "hauevnqxexvmoptg", // App password
    },
});

const getUsers = async (req, res) => {
  // updateField();
  try {
    const foundUsers = await User.find({
      "role.role": { $ne: "Admin" }, // Ensure no Admin users are returned
    });

    console.log(foundUsers); // Debug to check if Admin is excluded

    const formattedUsers = foundUsers.map((user) => ({
      _id: user._id,
      username: user.username,
      role: user.role,
      department: user.department,
      designation: user.designation,
      email: user.email,
      number: user.number,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      maritalStatus: user.maritalStatus,
      nationality: user.nationality,
      doj: user.doj,
      profileImage: user.profileImage,
      isFirstLogin: user.isFirstLogin,
      reset: user.reset,
    }));

    res.status(200).json({ users: formattedUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      username,
      password,
      role,
      email,
      number,
      address,
      dob,
      gender,
      maritalStatus,
      nationality,
      doj,
      department,
      designation,
    } = req.body;
    console.log(req.body);
    if (
      !username ||
      !password ||
      !role ||
      !email ||
      !department ||
      !designation ||
      !address ||
      !dob ||
      !number ||
      !gender ||
      !maritalStatus ||
      !nationality ||
      !doj
    )
      return res.status(400).json({
        message:
          "username, password, role, email, number, address, dob, gender, maritalStatus, nationality, doj, department and designation are required",
      });
    const exists = ROLES_LIST.some(
      (r) => r.role === role.role && r.roleValue === role.roleValue
    );
    if (!exists)
      return res.status(400).json({
        message: `Role '${role.role}' with value '${role.roleValue}' does not exist`,
      });
    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: username,
      password: hashedPwd,
      role: role,
      department: department,
      designation: designation,
      email: email,
      number: number,
      address: address,
      dob: dob,
      gender: gender,
      maritalStatus: maritalStatus,
      nationality: nationality,
      doj: doj,
      isFirstLogin: req.body?.isFirstLogin,
      reset: req.body?.reset,
    });
    // newUser.save();
    // console.log(newUser);
    // Format the new user
    const formattedNewUser = {
      _id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      department: newUser.department,
      designation: newUser.designation,
      email: newUser.email,
      number: newUser.number,
      address: newUser.address,
      dob: newUser.dob,
      gender: newUser.gender,
      maritalStatus: newUser.maritalStatus,
      nationality: newUser.nationality,
      doj: newUser.doj,
      profileImage: newUser.profileImage,
      isFirstLogin: newUser.isFirstLogin,
      reset: newUser.reset,
    };

    if (role.roleValue === 1011)
      return res
        .status(200)
        .json({ message: "User created successfully", user: formattedNewUser });
    // Creating attendance id as userId after the user has been created successfully
    const createAttendanceId = await Attendance.create({
      _id: newUser._id,
      username: newUser.username,
      profileImage: newUser.profileImage
    });
    // createAttendanceId.save();
    // Creating attendance id as userId after the user has been created successfully
    // const createPlanId = await Plan.create({
    //   _id: newUser._id,
    // });
    // createPlanId.save();
    // Creating visitLog id as userId after the user has been created successfully
    const createVisitLogId = await VisitLog.create({
      _id: newUser._id,
      username: newUser.username,
    });
    // createVisitLogId.save();
    // Creating visitLog id as userId after the user has been created successfully
    const createReferralLogId = await Referral.create({
      _id: newUser._id,
      username: newUser.username,
    });

    const createLocationId = await Location.create({
      _id: newUser._id,
      username: newUser.username,
    });

    await transporter.sendMail({
            from: "deskgoo2024@gmail.com",
            to: email,
            subject: "Welcome to Deskgoo Track App",
            text: `Hello ${username},

        Welcome to Deskgoo Track App!

        Your account has been successfully created. You can now log in using the credentials below:

        📧 Email: ${email}
        🔐 Password: ${username}
        👨‍💼 Role: ${role.role}

        📱 Download the TMS app: 
        - Android (Play Store): coming soon on play store
        - iOS (App Store): coming soon on app store

        We recommend changing your password after your first login for security purposes.

        If you have any questions, feel free to reach out.

        Best regards,  
        Deskgoo Track Team`,
        });

    // createReferralLogId.save();
    res.status(200).json({
      message: "User created successfully",
      user: formattedNewUser,
      attendance: createAttendanceId,
      // plan: createPlanId,
      visitLog: createVisitLogId,
      referral: createReferralLogId,
      location: createLocationId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRolesList = (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Roles list sent successfully", roles: ROLES_LIST });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function updateField() {
  // Find users with visitLogs that have missing visitDate
  const users = await VisitLog.find({
    "visitLogs.visitDate": { $exists: false },
  });

  // Iterate over each user
  for (const user of users) {
    // Iterate over each visitLog in the user's visitLogs array
    for (const visitLog of user.visitLogs) {
      // Check if visitDate is missing
      if (!visitLog.visitDate) {
        // Update the specific visitLog entry with the current date
        await User.updateOne(
          { _id: user._id, "visitLogs._id": visitLog._id },
          { $set: { "visitLogs.$.visitDate": new Date() } }
        );
      }
    }
  }
}

module.exports = { getUsers, createUser, getRolesList };
