const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// SIGNUP Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already in use." });
    }

    // Create user (password hashing happens in User model hook)
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "my_super_secret_key_123",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LOGIN Route
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginKey = identifier || email;

    if (!loginKey || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    const user = await User.findOne({
      $or: [{ email: loginKey }, { username: loginKey }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

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