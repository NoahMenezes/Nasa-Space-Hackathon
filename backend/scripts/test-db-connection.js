import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, "../.env") });

console.log("🔍 Testing PostgreSQL Database Connection...\n");

// Display configuration (without password)
console.log("📋 Configuration:");
console.log(`   Host:     ${process.env.DB_HOST || "localhost"}`);
console.log(`   Port:     ${process.env.DB_PORT || "5432"}`);
console.log(`   Database: ${process.env.DB_NAME || "nasa_hackathon"}`);
console.log(`   User:     ${process.env.DB_USER || "postgres"}`);
console.log(`   Password: ${process.env.DB_PASSWORD ? "****" + process.env.DB_PASSWORD.slice(-2) : "NOT SET"}\n`);

const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "nasa_hackathon",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(dbConfig);

async function testConnection() {
  let client;

  try {
    console.log("⏳ Attempting to connect...");
    client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL!\n");

    // Test query
    console.log("🔍 Running test query...");
    const result = await client.query("SELECT version(), current_database()");
    console.log("✅ Query executed successfully!\n");

    console.log("📊 Database Info:");
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   Version:  ${result.rows[0].version.split(" ").slice(0, 2).join(" ")}\n`);

    // Check if tables exist
    console.log("📋 Checking tables...");
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log("⚠️  No tables found. Run the backend server to initialize tables.\n");
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
      console.log("");
    }

    // Check experiments count
    const experimentsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'experiments'
      ) as table_exists
    `);

    if (experimentsCheck.rows[0].table_exists) {
      const countResult = await client.query("SELECT COUNT(*) FROM experiments");
      const count = parseInt(countResult.rows[0].count);
      console.log("🔬 Experiments Data:");
      if (count === 0) {
        console.log("   ⚠️  No experiments loaded. Run: npm run migrate-experiments\n");
      } else {
        console.log(`   ✅ ${count} experiments loaded\n`);
      }
    }

    console.log("🎉 Database connection test completed successfully!");
    console.log("✅ Your database is ready to use!\n");
  } catch (error) {
    console.error("❌ Connection test failed!\n");
    console.error("Error details:");
    console.error(`   Code:    ${error.code || "N/A"}`);
    console.error(`   Message: ${error.message}\n`);

    console.log("💡 Troubleshooting tips:");

    if (error.code === "ECONNREFUSED") {
      console.log("   ❌ PostgreSQL is not running or not accessible");
      console.log("   🔧 Start PostgreSQL:");
      console.log("      - Windows: Check Services or run 'pg_ctl start'");
      console.log("      - macOS:   brew services start postgresql@14");
      console.log("      - Linux:   sudo systemctl start postgresql\n");
    } else if (error.code === "28P01") {
      console.log("   ❌ Password authentication failed");
      console.log("   🔧 Check your .env file and verify DB_PASSWORD is correct\n");
    } else if (error.code === "3D000") {
      console.log("   ❌ Database does not exist");
      console.log("   🔧 Create the database:");
      console.log("      psql -U postgres -c 'CREATE DATABASE nasa_hackathon;'\n");
    } else if (error.code === "28000") {
      console.log("   ❌ Invalid authorization specification");
      console.log("   🔧 Check DB_USER in .env file\n");
    } else {
      console.log("   🔧 Check your database configuration in backend/.env");
      console.log("   🔧 Ensure PostgreSQL is running");
      console.log("   🔧 Verify credentials are correct\n");
    }

    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection();
