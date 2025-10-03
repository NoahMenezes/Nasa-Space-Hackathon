import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout for ML operations
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/#/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  verifyToken: () => api.get("/auth/verify"),
};

// ML Model API calls
export const mlAPI = {
  // Get available models
  getModels: () => api.get("/ml/models"),

  // Classification endpoint
  classify: (data) => api.post("/ml/classify", data),

  // Object detection with image upload
  detect: (formData) => {
    return api.post("/ml/detect", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Predictive analysis
  predict: (data) => api.post("/ml/predict", data),

  // Anomaly detection
  detectAnomalies: (data) => api.post("/ml/anomaly-detection", data),

  // Time series analysis
  analyzeTimeSeries: (data) => api.post("/ml/time-series", data),

  // Get prediction history
  getPredictions: (params = {}) => api.get("/ml/predictions", { params }),

  // Get ML usage statistics
  getUsageStats: () => api.get("/ml/usage-stats"),

  // Health check for ML API
  checkHealth: () => api.get("/ml/health"),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  addToFavorites: (data) => api.post("/users/favorites", data),
  getFavorites: (params = {}) => api.get("/users/favorites", { params }),
  removeFavorite: (id) => api.delete(`/users/favorites/${id}`),
  getMLHistory: (params = {}) => api.get("/users/ml-history", { params }),
  getUserStats: () => api.get("/users/stats"),
};

// Helper functions for ML operations
export const mlHelpers = {
  // Prepare image file for detection
  prepareImageForDetection: (file, detectionType = "space_objects") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("detection_type", detectionType);
    return formData;
  },

  // Prepare classification data
  prepareClassificationData: (
    dataType,
    inputData,
    modelVersion = "latest",
  ) => ({
    data_type: dataType,
    input_data: inputData,
    model_version: modelVersion,
  }),

  // Prepare prediction data
  preparePredictionData: (
    predictionType,
    historicalData,
    horizon = 30,
    parameters = {},
  ) => ({
    prediction_type: predictionType,
    historical_data: historicalData,
    prediction_horizon: horizon,
    parameters,
  }),

  // Prepare anomaly detection data
  prepareAnomalyData: (
    dataset,
    sensitivity = "medium",
    algorithm = "isolation_forest",
  ) => ({
    dataset,
    sensitivity,
    algorithm,
  }),

  // Prepare time series data
  prepareTimeSeriesData: (
    timeSeriesData,
    analysisType = "forecast",
    forecastSteps = 10,
  ) => ({
    time_series_data: timeSeriesData,
    analysis_type: analysisType,
    forecast_steps: forecastSteps,
  }),
};

// Data transformation utilities
export const dataUtils = {
  // Format ML prediction result for display
  formatPredictionResult: (prediction) => ({
    id: prediction.id,
    modelType: prediction.model_type,
    result: prediction.prediction_result,
    confidence: prediction.confidence_score
      ? (prediction.confidence_score * 100).toFixed(2) + "%"
      : "N/A",
    processingTime: prediction.processing_time
      ? prediction.processing_time + "ms"
      : "N/A",
    createdAt: new Date(prediction.created_at).toLocaleString(),
  }),

  // Format user statistics
  formatUserStats: (stats) => ({
    user: stats.user,
    totalPredictions: stats.total_predictions || 0,
    totalFavorites: stats.total_favorites || 0,
    mlUsage:
      stats.ml_usage?.map((usage) => ({
        modelType: usage.model_type,
        count: parseInt(usage.prediction_count),
        avgConfidence: usage.avg_confidence
          ? (parseFloat(usage.avg_confidence) * 100).toFixed(1) + "%"
          : "N/A",
        avgProcessingTime: usage.avg_processing_time
          ? Math.round(parseFloat(usage.avg_processing_time)) + "ms"
          : "N/A",
        lastUsed: new Date(usage.last_prediction).toLocaleString(),
      })) || [],
    favoritesBreakdown:
      stats.favorites_breakdown?.map((fav) => ({
        type: fav.data_type,
        count: parseInt(fav.favorite_count),
      })) || [],
  }),

  // Validate file for upload
  validateFile: (file, maxSize = 50 * 1024 * 1024) => {
    const errors = [];

    if (!file) {
      errors.push("No file selected");
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "text/csv",
      "application/json",
    ];
    if (!allowedTypes.includes(file.type)) {
      errors.push("Invalid file type. Allowed: JPEG, PNG, GIF, CSV, JSON");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Error handling utilities
export const errorUtils = {
  // Extract meaningful error message
  getErrorMessage: (error) => {
    if (error.response?.data?.details) {
      return error.response.data.details;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  },

  // Check if error is due to ML API being down
  isMLAPIError: (error) => {
    return (
      error.response?.status === 503 ||
      error.message?.includes("ML API") ||
      error.code === "ECONNREFUSED"
    );
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    return error.response?.status === 401 || error.response?.status === 403;
  },
};

// Helper functions
export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

// Health check
export const checkHealth = () => api.get("/health");

// API info
export const getAPIInfo = () => api.get("/info");

export default api;
