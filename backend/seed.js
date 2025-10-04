// In Backend/seed.js
import fs from 'fs';
import { parse } from 'csv-parse';
import { pool } from './config/database.js'; // Correct path

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    // Correct path to your CSV file
    const csvFilePath = './data/expts_authors_links.csv';
    const parser = fs.createReadStream(csvFilePath)
      .pipe(parse({ columns: true, bom: true }));

    console.log('Starting to seed the experiments table in Supabase...');

    for await (const row of parser) {
      if (row.Title && row.Authors && row.Link) {
        await client.query(
          'INSERT INTO experiments (title, authors, link) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [row.Title, row.Authors, row.Link]
        );
      }
    }

    console.log('✅ Database seeding complete.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase();