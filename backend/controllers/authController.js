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
      subject: "Your OTP Verification Code - Futsal Flow",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 16px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #3b82f6; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">FUTSAL FLOW</h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Elevate your game in Nepal</p>
          </div>
          
          <div style="background-color: #1e293b; padding: 40px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
            <h2 style="margin-top: 0; color: #f8fafc; font-size: 20px;">Email Verification</h2>
            <p style="color: #94a3b8; font-size: 16px;">Please use the following 6-digit code to verify your account:</p>
            
            <div style="margin: 30px 0;">
              <span style="display: inline-block; padding: 15px 30px; background-color: #3b82f6; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 12px; border-radius: 8px; border: 1px solid #2563eb; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${otp}
              </span>
            </div>
            
            <p style="color: #64748b; font-size: 13px; margin-top: 30px;">
              This code will expire in 10 minutes.<br/>
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #475569; font-size: 12px;">
            <p>© 2026 Futsal Flow. All rights reserved.</p>
          </div>
        </div>
      `,
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

exports.logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out" });
};

// Get current user
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// Update profile (Me)
exports.updateMe = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    let avatar = req.body.avatar;

    // Handle file upload
    if (req.file) {
      avatar = `/uploads/profiles/${req.file.filename}`;
    }

    // Direct block for restricted fields
    if (req.body.email) {
      return res.status(400).json({
        message: "Gmail updates are restricted for platform integrity.",
      });
    }

    if (req.body.role) {
      return res.status(400).json({ message: "Role updates are restricted." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ success: true, message: "Account deleted." });
  } catch (err) {
    next(err);
  }
};