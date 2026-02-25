const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Connect to Database
connectDB();

// Security
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Production Middlewares
app.use(mongoSanitize());
app.use(compression());

// Middleware
app.use(express.json());
app.use(require("cookie-parser")());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Middleware
app.use(express.json());
app.use(require("cookie-parser")());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Routes
app.get("/health", (req, res) =>
  res.status(200).json({ status: "OK", timestamp: new Date() }),
);

// Serve Static Assets in Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);