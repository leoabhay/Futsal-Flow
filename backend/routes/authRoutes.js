const express = require("express");
const {
  signup,
  verifyOTP,
  login,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;