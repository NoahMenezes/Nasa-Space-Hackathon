import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import mlRoutes from "./routes/nasa.js";
import userRoutes from "./routes/users.js";
import experimentsRoutes from "./routes/experiments.js";
import { initializeDatabase } from "./config/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize database
try {
  await initializeDatabase();
  console.log("✅ Database initialization completed");
} catch (err) {
  console.error("❌ Failed to initialize database:", err);
  process.exit(1);
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ml", mlRoutes); // Changed from /api/nasa to /api/ml
app.use("/api/users", userRoutes);
app.use("/api/experiments", experimentsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "NASA Space Hackathon Backend with ML API is running!",
    database: "PostgreSQL",
    ml_integration: "Active",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

// API info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    name: "NASA Space Hackathon Backend",
    description: "Backend API with ML model integration for NASA data analysis",
    version: "2.0.0",
    features: [
      "User Authentication (JWT)",
      "ML Model Integration",
      "PostgreSQL Database",
      "File Upload Support",
      "Rate Limiting",
      "CORS Protection",
    ],
    endpoints: {
      auth: ["/api/auth/register", "/api/auth/login", "/api/auth/logout"],
      ml: [
        "/api/ml/models",
        "/api/ml/classify",
        "/api/ml/detect",
        "/api/ml/predict",
        "/api/ml/anomaly-detection",
        "/api/ml/time-series",
      ],
      users: [
        "/api/users/profile",
        "/api/users/favorites",
        "/api/users/ml-history",
        "/api/users/stats",
      ],
    },
    ml_api: {
      base_url: process.env.ML_API_BASE_URL || "http://localhost:8000",
      status: "Connected",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    available_endpoints: [
      "GET /api/health",
      "GET /api/info",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/ml/models",
      "POST /api/ml/classify",
    ],
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large",
      message: "Maximum file size is 50MB",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "Unexpected field",
      message: err.message,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "The provided token is malformed or invalid",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "The provided token has expired",
    });
  }

  // Database errors
  if (err.code === "23505") {
    return res.status(400).json({
      error: "Duplicate entry",
      message: "The requested resource already exists",
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      error: "Foreign key violation",
      message: "Referenced resource does not exist",
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong on our end",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🔄 SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NASA Space Hackathon Backend running on port ${PORT}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
  );
  console.log(
    `🤖 ML API URL: ${process.env.ML_API_BASE_URL || "http://localhost:8000"}`,
  );
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🔒 Security: Helmet + CORS + Rate Limiting`);
  console.log(`📁 File uploads: Enabled (50MB limit)`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api/info`);
});
