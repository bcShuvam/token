const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.user?.role?.role) {
      return res.status(401).json({ message: "Unauthorized: No role found" });
    }

    const userRole = req.user.role.role; // extract "Admin", "Marketing Staff", etc.
    const rolesArray = [...allowedRoles];

    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    next();
  };
};

module.exports = {verifyRole};