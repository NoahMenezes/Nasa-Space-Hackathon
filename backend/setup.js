// In Backend/setup.js
import { initializeDatabase, pool } from './config/database.js'; // Correct path

const setup = async () => {
  console.log('Attempting to initialize database schema in Supabase...');
  try {
    await initializeDatabase();
    console.log('✅ Database schema established successfully.');
  } catch (error) {
    console.error('❌ Failed to establish database schema:', error);
  } finally {
    await pool.end();
  }
};

setup();