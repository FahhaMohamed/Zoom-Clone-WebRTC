const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../utils/validators");
const { userRes } = require("../utils/userRes");

// Register
router.post("/register", async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { email, password, name } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ status: false, message: "Email already exists" });

    user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "72h",
    });

    res.status(201).json({
      status: true,
      token,
      user: userRes(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "72h",
    });

    res.json({
      token,
      user: userRes(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/profile", auth, async (req, res) => {
  res.json({
    status: true,
    user: req.user,
  });
});

module.exports = router;
