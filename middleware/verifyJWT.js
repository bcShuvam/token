const jwt = require("jsonwebtoken");
const Users = require("../model/users");

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const _id = req.headers._id;
  if (!authHeader?.startsWith("Bearer")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  const foundUser = await Users.findById(_id);
  if (!foundUser)
    return res.status(404).json({ message: `_id ${_id} not found` });
  if (foundUser.accessToken !== token)
    return res
      .status(403)
      .json({ message: "accessToken not matched", customCode: 11 });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Access token expired", customCode: 10 }); // invalid token
    req.user = decoded.formattedUserDetail;
    next();
  });
};

const verifyRefreshToken = async (req, res, next) => {
  try {
    const { _id, refreshToken } = req.body;
    if (!_id || !refreshToken)
      return res
        .status(400)
        .json({ message: "_id and refreshToken are required" });

    const foundUser = await Users.findById(_id);
    if (!foundUser) return res.status(404).json({ message: `User not found` });

    if (foundUser.refreshToken !== refreshToken)
      return res
        .status(400)
        .json({ message: `refreshToken not matched`, customCode: 21 });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          foundUser.refreshToken = "";
          foundUser.save();
          return res
            .status(403)
            .json({ message: "Refresh token expired", customCode: 20 });
        }

        const formattedUserDetail = {
          _id: foundUser._id,
          username: foundUser.username,
          role: foundUser.role,
          department: foundUser.department,
          designation: foundUser.designation,
          email: foundUser.email,
          number: foundUser.number,
          address: foundUser.address,
          dob: foundUser.dob,
          isFirstLogin: foundUser.isFirstLogin,
          reset: foundUser.reset,
        };

        const accessToken = jwt.sign(
          { formattedUserDetail },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        foundUser.accessToken = accessToken;
        foundUser.save();

        // Send the new access token and terminate the middleware chain
        return res.status(200).json({
          message: "New access token generated successfully",
          accessToken,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { verifyJWT, verifyRefreshToken };
