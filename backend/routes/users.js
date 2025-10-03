import express from "express";
import { query } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1",
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const result = await query(
      "UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, updated_at",
      [username, req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: "Database error" });
    }
  }
});

// Add to favorites
router.post("/favorites", authenticateToken, async (req, res) => {
  try {
    const { dataType, dataId, dataContent } = req.body;

    if (!dataType || !dataId) {
      return res
        .status(400)
        .json({ error: "dataType and dataId are required" });
    }

    // Check if already favorited
    const existing = await query(
      "SELECT id FROM favorites WHERE user_id = $1 AND data_type = $2 AND data_id = $3",
      [req.user.userId, dataType, dataId],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Item already in favorites" });
    }

    const result = await query(
      "INSERT INTO favorites (user_id, data_type, data_id, data_content) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.userId, dataType, dataId, JSON.stringify(dataContent)],
    );

    res.status(201).json({
      message: "Added to favorites",
      favorite: result.rows[0],
    });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
});

// Get user favorites
router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const { data_type, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT * FROM favorites
      WHERE user_id = $1
    `;
    const params = [req.user.userId];
    let paramCount = 1;

    if (data_type) {
      queryText += ` AND data_type = $${++paramCount}`;
      params.push(data_type);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    const favorites = result.rows.map((fav) => ({
      ...fav,
      data_content:
        typeof fav.data_content === "string"
          ? JSON.parse(fav.data_content)
          : fav.data_content,
    }));

    res.json({
      success: true,
      data: favorites,
      total: favorites.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Remove from favorites
router.delete("/favorites/:id", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Get user's ML prediction history with enhanced filtering
router.get("/ml-history", authenticateToken, async (req, res) => {
  try {
    const {
      model_type,
      limit = 20,
      offset = 0,
      start_date,
      end_date,
    } = req.query;

    let queryText = `
      SELECT id, model_type, input_data, prediction_result,
             confidence_score, processing_time, created_at
      FROM ml_predictions
      WHERE user_id = $1
    `;

    const params = [req.user.userId];
    let paramCount = 1;

    if (model_type) {
      queryText += ` AND model_type = $${++paramCount}`;
      params.push(model_type);
    }

    if (start_date) {
      queryText += ` AND created_at >= $${++paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      queryText += ` AND created_at <= $${++paramCount}`;
      params.push(end_date);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM ml_predictions
      WHERE user_id = $1
    `;
    const countParams = [req.user.userId];
    let countParamCount = 1;

    if (model_type) {
      countQuery += ` AND model_type = $${++countParamCount}`;
      countParams.push(model_type);
    }

    if (start_date) {
      countQuery += ` AND created_at >= $${++countParamCount}`;
      countParams.push(start_date);
    }

    if (end_date) {
      countQuery += ` AND created_at <= $${++countParamCount}`;
      countParams.push(end_date);
    }

    const countResult = await query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more:
          parseInt(offset) + result.rows.length <
          parseInt(countResult.rows[0].total),
      },
    });
  } catch (error) {
    console.error("Failed to fetch ML history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ML prediction history",
    });
  }
});

// Get user statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // Get user's ML usage statistics
    const mlStats = await query(
      `SELECT
         model_type,
         COUNT(*) as prediction_count,
         AVG(confidence_score) as avg_confidence,
         AVG(processing_time) as avg_processing_time,
         MAX(created_at) as last_prediction
       FROM ml_predictions
       WHERE user_id = $1
       GROUP BY model_type
       ORDER BY prediction_count DESC`,
      [req.user.userId],
    );

    // Get favorites count by type
    const favoritesStats = await query(
      `SELECT
         data_type,
         COUNT(*) as favorite_count
       FROM favorites
       WHERE user_id = $1
       GROUP BY data_type
       ORDER BY favorite_count DESC`,
      [req.user.userId],
    );

    // Get user profile info
    const userInfo = await query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [req.user.userId],
    );

    res.json({
      success: true,
      data: {
        user: userInfo.rows[0],
        ml_usage: mlStats.rows,
        favorites_breakdown: favoritesStats.rows,
        total_predictions: mlStats.rows.reduce(
          (sum, stat) => sum + parseInt(stat.prediction_count),
          0,
        ),
        total_favorites: favoritesStats.rows.reduce(
          (sum, stat) => sum + parseInt(stat.favorite_count),
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user statistics",
    });
  }
});

export default router;
