const Booking = require("../models/Booking");
const Futsal = require("../models/Futsal");

// Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { futsalId, date, startTime, endTime } = req.body;

    const futsal = await Futsal.findById(futsalId);
    if (!futsal) return res.status(404).json({ message: "Futsal not found" });

    // Calculate total price (Simplified: assuming 1 hour slots)
    const totalPrice = futsal.pricePerHour;

    const booking = await Booking.create({
      user: req.user.id,
      futsal: futsalId,
      date: new Date(date),
      startTime,
      endTime,
      totalPrice,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This slot is already booked" });
    }
    next(err);
  }
};

// Get my bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("futsal", "name location images")
      .sort("-createdAt");
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// Get all bookings (Admin)
exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("futsal", "name")
      .sort("-createdAt");
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// Get bookings for ground owned by current user
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const futsal = await Futsal.findOne({ owner: req.user.id });
    if (!futsal) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const bookings = await Booking.find({ futsal: futsal._id })
      .populate("user", "name email")
      .sort("-createdAt");

    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// Update booking (Admin or Owner)
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id).populate("futsal");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Auth check: Admin, Owner of the ground OR the Booking Owner themselves
    const isGroundOwner = booking.futsal.owner.toString() === req.user.id;
    const isBookingOwner = booking.user.toString() === req.user.id;

    if (req.user.role !== "admin" && !isGroundOwner && !isBookingOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to manage this booking." });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// Delete booking (Admin or Owner)
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("futsal");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Auth check: Admin, Owner of the ground OR the Booking Owner themselves
    const isGroundOwner = booking.futsal.owner.toString() === req.user.id;
    const isBookingOwner = booking.user.toString() === req.user.id;

    if (req.user.role !== "admin" && !isGroundOwner && !isBookingOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove this booking." });
    }

    await booking.deleteOne();
    res.status(200).json({ success: true, message: "Booking removed" });
  } catch (err) {
    next(err);
  }
};
