const express = require("express");
const {
  signup,
  verifyOTP,
  login,
  logout,
  getMe,
  updateMe,
  deleteMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../utils/localUpload");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/update-me", protect, upload.single("avatar"), updateMe);
router.delete("/delete-me", protect, deleteMe);

module.exports = router;
