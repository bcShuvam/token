const users = require("../model/users");

const getUsers = (req, res) => {
  res.status(200).json(users);
};

module.exports = getUsers;
