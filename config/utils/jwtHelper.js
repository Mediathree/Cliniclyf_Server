require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role_id: user.role_id }, // Include role_id in the payload
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
