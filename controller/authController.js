const users = require("../model/users");
const handleLogin = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "username and password are required" });
    const foundUser = users.find(
      (user) => user.username === username && user.pwd === password
    );
    console.log(username, password);
    console.log(foundUser);
    if (!foundUser)
      return res
        .status(404)
        .json({ message: "Incorrect username or password" });

    // If user is found
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = handleLogin;
