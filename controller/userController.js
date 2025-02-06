const User = require("../model/users");
const Attendance = require("../model/attendance");
const VisitLog = require("../model/visitLog");
const Referral = require("../model/referral");
const Location = require("../model/location");
const Plan = require("../model/plan");
const bcrypt = require("bcrypt");
const ROLES_LIST = require("../config/roles_list");

const getUsers = async (req, res) => {
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
  const user = await User.find({ accessToken: { $exists: false } });
  for (let accessToken in user) {
    await User.updateMany({ $set: { accessToken: "" } });
  }
}

module.exports = { getUsers, createUser, getRolesList };
