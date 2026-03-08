const Futsal = require("../models/Futsal");

// Create a new Futsal ground (Admin or Owner)
exports.createFutsal = async (req, res, next) => {
  try {
    // If owner, check if they already have a futsal
    if (req.user.role === "owner") {
      const existingFutsal = await Futsal.findOne({ owner: req.user.id });
      if (existingFutsal) {
        return res
          .status(400)
          .json({ message: "Owners can only register one futsal ground." });
      }
    }

    const { name, location, description, pricePerHour, availableSlots } =
      req.body;

    const images = req.files ? req.files.map((file) => file.path) : [];

    const futsal = await Futsal.create({
      name,
      location,
      description,
      pricePerHour: Number(pricePerHour),
      availableSlots: availableSlots ? JSON.parse(availableSlots) : undefined,
      images,
      owner:
        req.user.role === "admin" && req.body.owner
          ? req.body.owner
          : req.user.id,
    });

    res.status(201).json({ success: true, data: futsal });
  } catch (err) {
    next(err);
  }
};

// Get all futsal grounds
exports.getAllFutsals = async (req, res, next) => {
  try {
    const { location, maxPrice } = req.query;
    let query = {};

    if (location) query.location = { $regex: location, $options: "i" };
    if (maxPrice) query.pricePerHour = { $lte: Number(maxPrice) };

    const futsals = await Futsal.find(query);
    res
      .status(200)
      .json({ success: true, count: futsals.length, data: futsals });
  } catch (err) {
    next(err);
  }
};

// Get futsal ground by ID
exports.getFutsalById = async (req, res, next) => {
  try {
    const futsal = await Futsal.findById(req.params.id);
    if (!futsal) return res.status(404).json({ message: "Futsal not found" });
    res.status(200).json({ success: true, data: futsal });
  } catch (err) {
    next(err);
  }
};

// Update futsal ground (Admin or Owner)
exports.updateFutsal = async (req, res, next) => {
  try {
    let futsal = await Futsal.findById(req.params.id);
    if (!futsal) return res.status(404).json({ message: "Futsal not found" });

    // Ensure user is owner or admin
    if (futsal.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this ground." });
    }

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => file.path);
    }

    if (req.body.availableSlots) {
      req.body.availableSlots = JSON.parse(req.body.availableSlots);
    }

    futsal = await Futsal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: futsal });
  } catch (err) {
    next(err);
  }
};

// Delete futsal ground (Admin or Owner)
exports.deleteFutsal = async (req, res, next) => {
  try {
    const futsal = await Futsal.findById(req.params.id);
    if (!futsal) return res.status(404).json({ message: "Futsal not found" });

    // Ensure user is owner or admin
    if (futsal.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this ground." });
    }

    await futsal.deleteOne();
    res.status(200).json({ success: true, message: "Futsal ground removed" });
  } catch (err) {
    next(err);
  }
};