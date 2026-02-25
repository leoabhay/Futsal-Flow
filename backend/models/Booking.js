const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    futsal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Futsal",
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "07:00"
    endTime: { type: String, required: true }, // e.g., "08:00"
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Prevent double booking for the same slot on the same date
bookingSchema.index({ futsal: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);