const express = require("express");
const {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);

router.route("/users/:id").put(updateUser).delete(deleteUser);

module.exports = router;
