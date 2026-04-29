import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'unitracker.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    phone           TEXT,
    role            TEXT NOT NULL CHECK(role IN ('admin','supervisor')),
    otp_hash        TEXT,
    otp_expires_at  INTEGER,
    otp_used        INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    location    TEXT NOT NULL,
    category    TEXT NOT NULL,
    photo_url   TEXT,
    barcode     TEXT UNIQUE NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    created_by  TEXT NOT NULL DEFAULT 'Admin'
  );

  CREATE TABLE IF NOT EXISTS scan_records (
    id          TEXT PRIMARY KEY,
    barcode     TEXT NOT NULL,
    item_id     TEXT,
    scanned_at  TEXT NOT NULL DEFAULT (datetime('now')),
    scanned_by  TEXT NOT NULL DEFAULT 'Supervisor',
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id                 TEXT PRIMARY KEY,
    item_id            TEXT NOT NULL,
    item_name          TEXT NOT NULL,
    item_barcode       TEXT NOT NULL,
    location           TEXT NOT NULL,
    description        TEXT NOT NULL,
    raised_by          TEXT NOT NULL DEFAULT 'Supervisor',
    raised_at          TEXT NOT NULL DEFAULT (datetime('now')),
    status             TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
    resolved_at        TEXT,
    resolved_by        TEXT,
    resolved_photo_url TEXT,
    resolved_note      TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_items_barcode    ON items(barcode);
  CREATE INDEX IF NOT EXISTS idx_items_category   ON items(category);
  CREATE INDEX IF NOT EXISTS idx_scan_barcode     ON scan_records(barcode);
  CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
  CREATE INDEX IF NOT EXISTS idx_complaints_item  ON complaints(item_id);
`);

export default db;
