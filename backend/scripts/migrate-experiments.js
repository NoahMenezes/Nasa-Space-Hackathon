import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrateExperiments = async () => {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting experiments migration...');

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

    console.log('✅ Experiments table created');

    // Create indexes for better search performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_experiments_title ON experiments USING gin(to_tsvector('english', title));
      CREATE INDEX IF NOT EXISTS idx_experiments_authors ON experiments USING gin(to_tsvector('english', authors));
      CREATE INDEX IF NOT EXISTS idx_experiments_link ON experiments(link);
    `);

    console.log('✅ Indexes created');

    // Check if data already exists
    const countResult = await client.query('SELECT COUNT(*) FROM experiments');
    const count = parseInt(countResult.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Experiments table already has ${count} records`);
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        rl.question('Do you want to clear and reload? (yes/no): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Migration cancelled');
        return;
      }

      await client.query('TRUNCATE TABLE experiments RESTART IDENTITY CASCADE');
      console.log('🗑️  Cleared existing data');
    }

    // Read and parse CSV file
    const csvPath = path.join(__dirname, '../data/expts_authors_links.csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`📊 Found ${records.length} experiments in CSV`);

    // Insert data in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      for (const record of batch) {
        await client.query(
          'INSERT INTO experiments (title, authors, link) VALUES ($1, $2, $3)',
          [record.Title, record.Authors, record.Link]
        );
        inserted++;
      }

      console.log(`✅ Inserted ${inserted}/${records.length} experiments`);
    }

    console.log('🎉 Experiments migration completed successfully!');
    console.log(`📊 Total experiments inserted: ${inserted}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migration
migrateExperiments()
  .then(() => {
    console.log('✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
