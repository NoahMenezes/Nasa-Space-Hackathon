import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { query } from "../config/database.js";

const router = express.Router();

// ML Model API Configuration
const ML_API_BASE_URL = process.env.ML_API_BASE_URL || "http://localhost:8000";
const ML_API_KEY = process.env.ML_API_KEY || "";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and data files
    const allowedTypes = /jpeg|jpg|png|gif|csv|json|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and data files are allowed"));
    }
  },
});

// Helper function to make ML API requests
const makeMLRequest = async (endpoint, data, method = "POST", headers = {}) => {
  try {
    const config = {
      method,
      url: `${ML_API_BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...(ML_API_KEY && { Authorization: `Bearer ${ML_API_KEY}` }),
        ...headers,
      },
      timeout: 30000, // 30 second timeout
    };

    if (method !== "GET") {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`ML API Error for ${endpoint}:`, error.message);
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "ML API request failed",
    );
  }
};

// Log ML API usage
const logMLUsage = async (endpoint, success, responseTime, error = null) => {
  try {
    await query(
      `INSERT INTO model_usage_stats (model_endpoint, success_count, error_count, avg_response_time, last_used)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (model_endpoint) DO UPDATE SET
         request_count = model_usage_stats.request_count + 1,
         success_count = model_usage_stats.success_count + $2,
         error_count = model_usage_stats.error_count + $3,
         avg_response_time = (model_usage_stats.avg_response_time + $4) / 2,
         last_used = CURRENT_TIMESTAMP`,
      [endpoint, success ? 1 : 0, success ? 0 : 1, responseTime],
    );
  } catch (dbError) {
    console.error("Failed to log ML usage:", dbError.message);
  }
};

// Get available ML models and their capabilities
router.get("/models", optionalAuth, async (req, res) => {
  const startTime = Date.now();

  try {
    const models = await makeMLRequest("/models", null, "GET");

    await logMLUsage("/models", true, Date.now() - startTime);

    res.json({
      success: true,
      data: models,
      message: "Available ML models retrieved successfully",
    });
  } catch (error) {
    await logMLUsage("/models", false, Date.now() - startTime, error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch available models",
      details: error.message,
    });
  }
});

// NASA Data Classification/Analysis
router.post("/classify", authenticateToken, async (req, res) => {
  const startTime = Date.now();

  try {
    const { data_type, input_data, model_version = "latest" } = req.body;

    if (!data_type || !input_data) {
      return res.status(400).json({
        success: false,
        error: "data_type and input_data are required",
      });
    }

    const payload = {
      data_type,
      input_data,
      model_version,
      user_id: req.user.userId,
    };

    const result = await makeMLRequest("/classify", payload);

    // Store prediction in database
    await query(
      `INSERT INTO ml_predictions (user_id, model_type, input_data, prediction_result, confidence_score, processing_time)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.userId,
        "classification",
        JSON.stringify(input_data),
        JSON.stringify(result),
        result.confidence || null,
        Date.now() - startTime,
      ],
    );

    await logMLUsage("/classify", true, Date.now() - startTime);

    res.json({
      success: true,
      data: result,
      processing_time: Date.now() - startTime,
    });
  } catch (error) {
    await logMLUsage("/classify", false, Date.now() - startTime, error.message);
    res.status(500).json({
      success: false,
      error: "Classification failed",
      details: error.message,
    });
  }
});

// Space Object Detection
router.post(
  "/detect",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    const startTime = Date.now();

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Image file is required",
        });
      }

      const formData = new FormData();
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      if (req.body.detection_type) {
        formData.append("detection_type", req.body.detection_type);
      }

      const result = await makeMLRequest("/detect", formData, "POST", {
        ...formData.getHeaders(),
      });

      // Store prediction in database
      await query(
        `INSERT INTO ml_predictions (user_id, model_type, input_data, prediction_result, confidence_score, processing_time)
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user.userId,
          "object_detection",
          JSON.stringify({
            filename: req.file.originalname,
            size: req.file.size,
          }),
          JSON.stringify(result),
          result.avg_confidence || null,
          Date.now() - startTime,
        ],
      );

      await logMLUsage("/detect", true, Date.now() - startTime);

      res.json({
        success: true,
        data: result,
        processing_time: Date.now() - startTime,
      });
    } catch (error) {
      await logMLUsage("/detect", false, Date.now() - startTime, error.message);
      res.status(500).json({
        success: false,
        error: "Object detection failed",
        details: error.message,
      });
    }
  },
);

// Predictive Analysis (e.g., orbital predictions, weather forecasting)
router.post("/predict", authenticateToken, async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      prediction_type,
      historical_data,
      prediction_horizon,
      parameters = {},
    } = req.body;

    if (!prediction_type || !historical_data) {
      return res.status(400).json({
        success: false,
        error: "prediction_type and historical_data are required",
      });
    }

    const payload = {
      prediction_type,
      historical_data,
      prediction_horizon: prediction_horizon || 30, // default 30 days
      parameters,
      user_id: req.user.userId,
    };

    const result = await makeMLRequest("/predict", payload);

    // Store prediction in database
    await query(
      `INSERT INTO ml_predictions (user_id, model_type, input_data, prediction_result, confidence_score, processing_time)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.userId,
        "predictive_analysis",
        JSON.stringify({
          prediction_type,
          data_points: historical_data.length,
        }),
        JSON.stringify(result),
        result.model_confidence || null,
        Date.now() - startTime,
      ],
    );

    await logMLUsage("/predict", true, Date.now() - startTime);

    res.json({
      success: true,
      data: result,
      processing_time: Date.now() - startTime,
    });
  } catch (error) {
    await logMLUsage("/predict", false, Date.now() - startTime, error.message);
    res.status(500).json({
      success: false,
      error: "Predictive analysis failed",
      details: error.message,
    });
  }
});

// Anomaly Detection in NASA datasets
router.post("/anomaly-detection", authenticateToken, async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      dataset,
      sensitivity = "medium",
      algorithm = "isolation_forest",
    } = req.body;

    if (!dataset || !Array.isArray(dataset)) {
      return res.status(400).json({
        success: false,
        error: "dataset must be an array of data points",
      });
    }

    const payload = {
      dataset,
      sensitivity,
      algorithm,
      user_id: req.user.userId,
    };

    const result = await makeMLRequest("/anomaly-detection", payload);

    // Store prediction in database
    await query(
      `INSERT INTO ml_predictions (user_id, model_type, input_data, prediction_result, processing_time)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.userId,
        "anomaly_detection",
        JSON.stringify({ data_points: dataset.length, algorithm }),
        JSON.stringify(result),
        Date.now() - startTime,
      ],
    );

    await logMLUsage("/anomaly-detection", true, Date.now() - startTime);

    res.json({
      success: true,
      data: result,
      processing_time: Date.now() - startTime,
    });
  } catch (error) {
    await logMLUsage(
      "/anomaly-detection",
      false,
      Date.now() - startTime,
      error.message,
    );
    res.status(500).json({
      success: false,
      error: "Anomaly detection failed",
      details: error.message,
    });
  }
});

// Time Series Analysis
router.post("/time-series", authenticateToken, async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      time_series_data,
      analysis_type = "forecast",
      forecast_steps = 10,
    } = req.body;

    if (!time_series_data || !Array.isArray(time_series_data)) {
      return res.status(400).json({
        success: false,
        error: "time_series_data must be an array",
      });
    }

    const payload = {
      time_series_data,
      analysis_type,
      forecast_steps,
      user_id: req.user.userId,
    };

    const result = await makeMLRequest("/time-series", payload);

    // Store prediction in database
    await query(
      `INSERT INTO ml_predictions (user_id, model_type, input_data, prediction_result, processing_time)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.userId,
        "time_series_analysis",
        JSON.stringify({ data_points: time_series_data.length, analysis_type }),
        JSON.stringify(result),
        Date.now() - startTime,
      ],
    );

    await logMLUsage("/time-series", true, Date.now() - startTime);

    res.json({
      success: true,
      data: result,
      processing_time: Date.now() - startTime,
    });
  } catch (error) {
    await logMLUsage(
      "/time-series",
      false,
      Date.now() - startTime,
      error.message,
    );
    res.status(500).json({
      success: false,
      error: "Time series analysis failed",
      details: error.message,
    });
  }
});

// Get user's ML prediction history
router.get("/predictions", authenticateToken, async (req, res) => {
  try {
    const { limit = 50, model_type, offset = 0 } = req.query;

    let queryText = `
      SELECT id, model_type, input_data, prediction_result, confidence_score,
             processing_time, created_at
      FROM ml_predictions
      WHERE user_id = $1
    `;

    const params = [req.user.userId];
    let paramCount = 1;

    if (model_type) {
      queryText += ` AND model_type = $${++paramCount}`;
      params.push(model_type);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch prediction history",
    });
  }
});

// Get ML model usage statistics (admin/analytics)
router.get("/usage-stats", authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT model_endpoint, request_count, success_count, error_count,
             avg_response_time, last_used, created_at
      FROM model_usage_stats
      ORDER BY request_count DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch usage stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch usage statistics",
    });
  }
});

// Health check for ML API
router.get("/health", async (req, res) => {
  try {
    const startTime = Date.now();
    await makeMLRequest("/health", null, "GET");

    res.json({
      success: true,
      message: "ML API is healthy",
      response_time: Date.now() - startTime,
      api_url: ML_API_BASE_URL,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: "ML API is unavailable",
      details: error.message,
      api_url: ML_API_BASE_URL,
    });
  }
});

export default router;
