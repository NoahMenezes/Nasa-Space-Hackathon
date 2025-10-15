// =================================================================
// START: GLOBAL ERROR HANDLERS (FOR DEBUGGING DEPLOYMENT)
// =================================================================

// This catches errors that happen in synchronous code
process.on('uncaughtException', (err, origin) => {
  console.error('!!!!!!!!!! UNCAUGHT EXCEPTION !!!!!!!!!!!');
  console.error(`Caught exception: ${err}`);
  console.error(`Exception origin: ${origin}`);
});

// This catches errors that happen in async code (Promises)
process.on('unhandledRejection', (reason, promise) => {
  console.error('!!!!!!!!!! UNHANDLED REJECTION !!!!!!!!!!!');
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import mlRoutes from "./routes/nasa.js";
import userRoutes from "./routes/users.js";
import experimentsRoutes from "./routes/experiments.js";
import { authenticateUser } from "./middleware/auth.js";

// Analysis routes
import executiveSummaryRoute from "./routes/executiveSummary.js";
import experimentDetailsRoute from "./routes/experimentDetails.js";
import keyFindingsRoute from "./routes/keyFindings.js";
import biologicalImpactsRoute from "./routes/biologicalImpacts.js";
import knowledgeGraphRoute from "./routes/knowledgeGraph.js";
import practicalApplicationsRoute from "./routes/practicalApplications.js";
import researchConnectionsRoute from "./routes/researchConnections.js";
import futureResearchRoute from "./routes/futureResearch.js";

import { initializeDatabase } from "./config/database.js";
import Backend from "three/src/renderers/common/Backend.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: "https://nasa-space-hackathon-frontend.onrender.com",
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
// Note: /api/auth routes are now handled by Supabase directly on the frontend
// The old auth routes (register, login, logout) have been removed
// All authentication is managed through Supabase Auth
app.use("/api/ml", mlRoutes);
app.use("/api/users", userRoutes);
app.use("/api/experiments", experimentsRoutes);

app.use(bodyParser.json());

// In your Backend/server.js file

// ... (your existing imports and middleware setup) ...

app.use(bodyParser.json());

// --- THIS IS THE FIX ---
// Add the main Gemini query route here, protected by authentication.
app.get('/api/query', authenticateUser, async (req, res, next) => {
  try {
    const searchQuery = req.query.query;
    if (!searchQuery) {
      return res.status(400).json({ error: "A search query is required." });
    }

    // Here, you would add your logic to:
    // 1. Find the best matching experiment in your database.
    // 2. Call the Gemini API with the experiment's link.
    // 3. Return the response.

    // For now, let's return a success message to confirm it works.
    // You will replace this with your actual Gemini logic.
    res.json({
      message: `Successfully received authenticated query for: "${searchQuery}"`,
      user: req.user.email,
      // ... your Gemini response will go here
    });

  } catch (error) {
    next(error); // Pass errors to your global error handler
  }
});
// --- END OF FIX ---

// 🚀 Analysis section routes (Protected with Supabase JWT authentication)
app.use("/executive-summary", authenticateUser, executiveSummaryRoute);
app.use("/experiment-details", authenticateUser, experimentDetailsRoute);
app.use("/key-findings", authenticateUser, keyFindingsRoute);
app.use("/biological-impacts", authenticateUser, biologicalImpactsRoute);
app.use("/knowledge-graph", authenticateUser, knowledgeGraphRoute);
app.use(
  "/practical-applications",
  authenticateUser,
  practicalApplicationsRoute,
);
app.use("/research-connections", authenticateUser, researchConnectionsRoute);
app.use("/future-research", authenticateUser, futureResearchRoute);

// Default route
app.get("/", (req, res) => res.send("NASA Experiment Analysis API running 🚀"));

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
      analysis: [
        "/executive-summary",
        "/experiment-details",
        "/key-findings",
        "/biological-impacts",
        "/knowledge-graph",
        "/practical-applications",
        "/research-connections",
        "/future-research",
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
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large", message: "Maximum file size is 50MB" });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res
      .status(400)
      .json({ error: "Unexpected field", message: err.message });
  }
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
// You must specify the host "0.0.0.0" for Render to detect the open port.
app.listen(PORT, "0.0.0.0", () => {
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
// --- END OF FIX ---