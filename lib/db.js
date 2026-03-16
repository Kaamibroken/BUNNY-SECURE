import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'bunny.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb(db);
  }
  return db;
}

function initDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT NOT NULL,
      reset_token TEXT,
      reset_expires INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      emoji TEXT DEFAULT '📦',
      color TEXT DEFAULT '#ff0000',
      is_visible INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS page_apis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      api_name TEXT NOT NULL,
      api_url TEXT NOT NULL,
      api_key TEXT DEFAULT '',
      method TEXT DEFAULT 'POST',
      body_template TEXT DEFAULT '{}',
      display_type TEXT DEFAULT 'cards',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      success INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin on first run
  const adminExists = db.prepare('SELECT id FROM admin WHERE id = 1').get();
  if (!adminExists) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'BUNNY', 12);
    db.prepare('INSERT INTO admin (id, username, password_hash, email) VALUES (1, ?, ?, ?)')
      .run(
        process.env.ADMIN_USERNAME || 'RAHEEL',
        hash,
        process.env.EMAIL_USER || 'kamibroken5@gmail.com'
      );
  }
}

export default getDb;
