const User = require("../model/users");
const Attendance = require("../model/attendance");

const getUsers = async (req, res) => {
  updateField();
  const foundUsers = await User.find();
  // res.status(200).json(userModel);
  console.log(foundUsers);
  res.status(200).json({ users: foundUsers });
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
    console.log(newUser);
    // Creating attendance id as userId after the user has been created successfully
    const createAttendanceId = await Attendance.create({
      _id: newUser._id,
    });
    createAttendanceId.save();
    res.status(200).json({ user: newUser, attendance: createAttendanceId });
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
