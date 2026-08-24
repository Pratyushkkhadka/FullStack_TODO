const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "my_super_secret_key_123"
    );

    const rawId = decoded.id || decoded._id || decoded.userId;
    req.user = { id: new mongoose.Types.ObjectId(rawId) };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid." });
  }
};