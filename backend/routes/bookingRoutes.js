const express = require("express");
const {
  createBooking,
  getMyBookings,
  getAllBookingsAdmin,
  getOwnerBookings,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("user"), createBooking)
  .get(protect, authorize("admin"), getAllBookingsAdmin);

router.get("/my", protect, authorize("user"), getMyBookings);
router.get("/owner", protect, authorize("owner"), getOwnerBookings);

router
  .route("/:id")
  .put(protect, authorize("admin", "owner", "user"), updateBooking)
  .delete(protect, authorize("admin", "owner", "user"), deleteBooking);

module.exports = router;
