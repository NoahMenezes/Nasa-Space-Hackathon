import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import { URL } from 'url'; // 1. Import the built-in URL class

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log("Attempting to connect with DATABASE_URL:", !!connectionString);


// --- FIX START: Forcing IPv4 Connection on Render ---
// 2. Parse the database URL to extract the hostname
const dbUrl = new URL(connectionString);
const dbHost = dbUrl.hostname;
// --- FIX END ---


const pool = new Pool({
  connectionString: connectionString,
  
  // --- FIX START: Forcing IPv4 Connection on Render ---
  // 3. Explicitly set the host. This encourages the client to resolve to an IPv4 address,
  // which solves the ENETUNREACH (network unreachable) error in IPv6-limited environments.
  host: dbHost,
  // --- FIX END ---

  // Keep the SSL requirement for production connections to Supabase
  ssl: {
    rejectUnauthorized: false
  }
});


// Test the connection
pool.on("connect", () => {
  console.log("🐘 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
  process.exit(-1);
});

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create favorites table for NASA data
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data_type VARCHAR(50) NOT NULL,
        data_id VARCHAR(255) NOT NULL,
        data_content JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ML predictions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ml_predictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        model_type VARCHAR(100) NOT NULL,
        input_data JSONB NOT NULL,
        prediction_result JSONB NOT NULL,
        confidence_score DECIMAL(5,4),
        processing_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create model usage stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS model_usage_stats (
        id SERIAL PRIMARY KEY,
        model_endpoint VARCHAR(200) NOT NULL,
        request_count INTEGER DEFAULT 1,
        success_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        avg_response_time DECIMAL(8,2),
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create experiments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiments (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        link TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create experiment analyses table for caching Gemini results
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiment_analyses (
        id SERIAL PRIMARY KEY,
        experiment_id INTEGER UNIQUE NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
        analysis_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_ml_predictions_user_id ON ml_predictions(user_id);
      CREATE INDEX IF NOT EXISTS idx_ml_predictions_model_type ON ml_predictions(model_type);
      CREATE INDEX IF NOT EXISTS idx_model_usage_stats_endpoint ON model_usage_stats(model_endpoint);
      CREATE INDEX IF NOT EXISTS idx_experiments_title ON experiments USING gin(to_tsvector('english', title));
      CREATE INDEX IF NOT EXISTS idx_experiments_authors ON experiments USING gin(to_tsvector('english', authors));
      CREATE INDEX IF NOT EXISTS idx_experiments_link ON experiments(link);
      CREATE INDEX IF NOT EXISTS idx_experiment_analyses_experiment_id ON experiment_analyses(experiment_id);
    `);

    // Create trigger to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_experiments_updated_at ON experiments;
      CREATE TRIGGER update_experiments_updated_at
          BEFORE UPDATE ON experiments
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_experiment_analyses_updated_at ON experiment_analyses;
      CREATE TRIGGER update_experiment_analyses_updated_at
          BEFORE UPDATE ON experiment_analyses
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("📊 Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Helper function to execute queries with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", {
      text: text.substring(0, 50),
      duration,
      rows: res.rowCount,
    });
    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

export { pool, query, initializeDatabase };