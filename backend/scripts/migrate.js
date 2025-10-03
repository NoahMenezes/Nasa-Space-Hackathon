import { initializeDatabase, pool } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
  try {
    console.log("🔄 Running database migrations...");
    console.log(`📍 Database: ${process.env.DB_NAME || "nasa_hackathon"}`);
    console.log(
      `🏠 Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}`,
    );

    await initializeDatabase();

    console.log("✅ Migrations completed successfully!");
    console.log("📊 Database tables created:");
    console.log("   - users (user accounts)");
    console.log("   - user_sessions (JWT sessions)");
    console.log("   - favorites (user favorites)");
    console.log("   - ml_predictions (ML prediction history)");
    console.log("   - model_usage_stats (ML API usage statistics)");
    console.log("🔍 Indexes created for optimal performance");
    console.log("🔧 Triggers set up for automatic timestamp updates");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("📋 Error details:", error);

    if (error.code === "ECONNREFUSED") {
      console.error(
        "💡 Suggestion: Make sure PostgreSQL is running and accessible",
      );
    } else if (error.code === "28P01") {
      console.error(
        "💡 Suggestion: Check your database credentials in .env file",
      );
    } else if (error.code === "3D000") {
      console.error(
        "💡 Suggestion: Create the database first using: CREATE DATABASE nasa_hackathon;",
      );
    }

    process.exit(1);
  } finally {
    try {
      await pool.end();
      console.log("🔌 Database connection closed");
    } catch (closeError) {
      console.error(
        "⚠️ Error closing database connection:",
        closeError.message,
      );
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;
