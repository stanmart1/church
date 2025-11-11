import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runNewMigrations() {
  try {
    const newMigrations = [
      '018_create_audit_logs.sql',
      '019_create_notifications.sql',
      '021_seed_initial_data.sql'
    ];

    console.log(`Running ${newMigrations.length} new migrations`);

    for (const file of newMigrations) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await pool.query(sql);
      console.log(`✓ ${file} completed`);
    }

    console.log('\n✓ All new migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runNewMigrations();
