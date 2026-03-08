const express = require("express");
const {
  createFutsal,
  getAllFutsals,
  getFutsalById,
  updateFutsal,
  deleteFutsal,
} = require("../controllers/futsalController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getAllFutsals)
  .post(protect, authorize("admin", "owner"), createFutsal);

router
  .route("/:id")
  .get(getFutsalById)
  .put(protect, authorize("admin", "owner"), updateFutsal)
  .delete(protect, authorize("admin", "owner"), deleteFutsal);

module.exports = router;