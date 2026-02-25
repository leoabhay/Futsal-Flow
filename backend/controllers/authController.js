const User = require("../models/User");
const OTP = require("../models/OTP");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Signup
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true },
    );

    // 3. Send OTP via Nodemailer (Mock configuration)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: '"Futsal Flow" <noreply@futsalflow.com>',
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    // 4. Save unverified user if not exists
    if (!user) {
      user = await User.create({ name, email, password, role: role || "user" });
    } else {
      // If user exists but is unverified, update their info including role
      user.name = name;
      user.password = password;
      user.role = role || user.role;
      await user.save();
    }

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );
    await OTP.deleteOne({ _id: otpRecord._id });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};

// Logout
exports.logout = (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.status(200).json({ success: true, message: "Logged out" });
};

// Get current user
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};