const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// LOGIN Route (Supports Email or Username)
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password } = req.body;

    // Accept 'identifier' OR fallback to 'email' field
    const loginKey = identifier || email;

    if (!loginKey || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Find user matching either username or email
    const user = await User.findOne({
      $or: [{ email: loginKey }, { username: loginKey }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password using bcrypt method on User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "my_super_secret_key_123",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;