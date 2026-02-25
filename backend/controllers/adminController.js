const Booking = require("../models/Booking");
const Futsal = require("../models/Futsal");
const User = require("../models/User");

// Get Admin Dashboard Stats
exports.getAdminStats = async (req, res, next) => {
  try {
    // 1. Basic Counts
    const totalBookings = await Booking.countDocuments();
    const totalFutsals = await Futsal.countDocuments();
    const totalUsers = await User.countDocuments();

    // 2. Revenue Calculation
    const revenueData = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 3. Monthly Bookings (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 4. Popular Futsals
    const popularFutsals = await Booking.aggregate([
      { $group: { _id: "$futsal", bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "futsals",
          localField: "_id",
          foreignField: "_id",
          as: "futsalDetails",
        },
      },
      { $unwind: "$futsalDetails" },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        totalFutsals,
        totalUsers,
        totalRevenue,
        monthlyStats,
        popularFutsals,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// Update user (except email)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isVerified, avatar } = req.body;

    // Direct block for restricted fields
    if (req.body.email) {
      return res
        .status(400)
        .json({
          message: "Gmail updates are restricted for platform integrity.",
        });
    }

    if (req.body.password) {
      return res
        .status(400)
        .json({ message: "Password cannot be modified via admin portal." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isVerified, avatar },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account." });
    }

    await User.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};