const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Role-based access middleware
exports.roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({ message: "Access Forbidden: Allowed only to Admin" });
    }
    next();
  };
};
