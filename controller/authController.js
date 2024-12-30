const Users = require("../model/users");
const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "username and password are required" });
    const foundUser = await Users.findOne({ username: username });
    if (!foundUser)
      return res
        .status(404)
        .json({ message: "Incorrect username or password" });
    const match = foundUser.password === password;
    if (!match) return res.status(401).json({ message: "Incorrect password" });
    if (foundUser.isFirstLogin || foundUser.reset) {
      const updatedUser = await Users.updateOne(
        { username: username },
        { $set: { isFirstLogin: false, reset: false } }
      );
      await updatedUser.save();
      return res
        .status(200)
        .json({ message: "Updated User Login successful", user: updatedUser });
    }
    // If user is found
    res.status(200).json({ message: "Login successful", user: foundUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = handleLogin;
