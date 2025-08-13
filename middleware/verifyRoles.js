const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.user?.role) {
            return res.status(401).json({ message: "Unauthorized: No role found" });
        }

        const rolesArray = [...allowedRoles];
        if (!rolesArray.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: Insufficient role" });
        }

        next();
    };
};

module.exports = {verifyRole};