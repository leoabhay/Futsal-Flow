const mongoose = require("mongoose");

const futsalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: String,
    pricePerHour: { type: Number, required: true },
    images: [String], // Array of Cloudinary URLs
    availableSlots: {
      type: [String],
      default: [
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
      ],
    },
    coordinates: {
      lat: { type: Number, default: 27.7172 }, // Default Kathmandu
      lng: { type: Number, default: 85.324 },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Futsal", futsalSchema);