const User = require("../model/users");
const Attendance = require("../model/attendance");
const VisitLog = require("../model/visitLog");
const Referral = require("../model/referral");
const Plan = require("../model/plan");

const getUsers = async (req, res) => {
  // updateField();
  const foundUsers = await User.find();
  const formattedUser = foundUsers.map((user) => ({
    _id: user._id,
    username: user.username,
    role: user.role,
    department: user.department,
    designation: user.designation,
    email: user.email,
    number: user.number,
    address: user.address,
    dob: user.dob,
    isFirstLogin: user.isFirstLogin,
    reset: user.reset,
  }));
  // res.status(200).json(userModel);
  console.log(foundUsers);
  res.status(200).json({ users: formattedUser });
};

const createUser = async (req, res) => {
  const { username, password, role, department, designation } = req.body;
  console.log(req.body);
  if (!username || !password || !role || !department || !designation)
    return res.status(400).json({
      message:
        "username, password, role, department and designation are required",
    });
  try {
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
      department: req.body.department,
      designation: req.body.designation,
      email: req.body?.email,
      number: req.body?.number,
      address: req.body?.address,
      dob: req.body?.dob,
      isFirstLogin: req.body?.isFirstLogin,
      reset: req.body?.reset,
    });
    newUser.save();
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
      isFirstLogin: newUser.isFirstLogin,
      reset: newUser.reset,
    };

    // Creating attendance id as userId after the user has been created successfully
    const createAttendanceId = await Attendance.create({
      _id: newUser._id,
    });
    createAttendanceId.save();

    // Creating attendance id as userId after the user has been created successfully
    const createPlanId = await Plan.create({
      _id: newUser._id,
    });
    createPlanId.save();

    // Creating visitLog id as userId after the user has been created successfully
    const createVisitLogId = await VisitLog.create({
      _id: newUser._id,
    });
    createVisitLogId.save();

    // Creating visitLog id as userId after the user has been created successfully
    const createReferralLogId = await Referral.create({
      _id: newUser._id,
    });
    createReferralLogId.save();

    res.status(200).json({
      user: formattedNewUser,
      attendance: createAttendanceId,
      plan: createPlanId,
      visitLog: createVisitLogId,
      referral: createReferralLogId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function updateField() {
  const user = await User.find({ age: { $exists: false } });
  for (let age in user) {
    await User.updateMany({ $set: { age: 0 } });
  }
}

module.exports = { getUsers, createUser };
