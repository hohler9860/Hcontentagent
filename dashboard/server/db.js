import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'data.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run migrations
function migrate() {
  const migrationsDir = join(__dirname, 'migrations');
  const applied = [];

  // Create migrations tracking table
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now'))
  )`);

  const files = ['001-initial.sql', '002-seed-accounts.sql'];

  for (const file of files) {
    const exists = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(file);
    if (!exists) {
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      applied.push(file);
    }
  }

  if (applied.length > 0) {
    console.log(`Applied migrations: ${applied.join(', ')}`);
  }
}

migrate();

export default db;
