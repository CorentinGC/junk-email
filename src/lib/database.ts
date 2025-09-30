/**
 * SQLite database for persistent address storage
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DB_PATH || './data';
const DB_FILE = path.join(DB_DIR, 'addresses.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_FILE);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    email_count INTEGER DEFAULT 0,
    last_email_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_address ON addresses(address);
  CREATE INDEX IF NOT EXISTS idx_created_at ON addresses(created_at DESC);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

console.log('[Database] Initialized:', DB_FILE);

/**
 * Save address to database
 */
export function saveAddress(address: string, createdAt: number, expiresAt: number): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO addresses (address, created_at, expires_at)
    VALUES (?, ?, ?)
  `);
  stmt.run(address, createdAt, expiresAt);
}

/**
 * Increment email count for address
 */
export function incrementEmailCount(address: string): void {
  const stmt = db.prepare(`
    UPDATE addresses
    SET email_count = email_count + 1,
        last_email_at = ?
    WHERE address = ?
  `);
  stmt.run(Date.now(), address);
}

/**
 * Get all addresses with pagination
 */
export function getAllAddresses(limit = 50, offset = 0): Array<{
  id: number;
  address: string;
  created_at: number;
  expires_at: number;
  email_count: number;
  last_email_at: number | null;
}> {
  const stmt = db.prepare(`
    SELECT * FROM addresses
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as any[];
}

/**
 * Get address by value
 */
export function getAddressByValue(address: string): {
  id: number;
  address: string;
  created_at: number;
  expires_at: number;
  email_count: number;
  last_email_at: number | null;
} | null {
  const stmt = db.prepare('SELECT * FROM addresses WHERE address = ?');
  return stmt.get(address) as any;
}

/**
 * Get statistics
 */
export function getStats(): {
  total_addresses: number;
  total_emails: number;
  active_addresses: number;
} {
  const now = Date.now();
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_addresses,
      SUM(email_count) as total_emails,
      SUM(CASE WHEN expires_at > ? THEN 1 ELSE 0 END) as active_addresses
    FROM addresses
  `);
  return stmt.get(now) as any;
}

/**
 * Cleanup expired addresses (optional, pour maintenance)
 */
export function cleanupExpired(): number {
  const now = Date.now();
  const stmt = db.prepare('DELETE FROM addresses WHERE expires_at < ?');
  const result = stmt.run(now);
  return result.changes;
}

/**
 * Get setting by key
 */
export function getSetting(key: string): string | null {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const result = stmt.get(key) as { value: string } | undefined;
  return result?.value || null;
}

/**
 * Set setting
 */
export function setSetting(key: string, value: string): void {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `);
  stmt.run(key, value, Date.now());
}

/**
 * Get email retention (from settings or env default)
 */
export function getEmailRetention(): number {
  const setting = getSetting('email_retention');
  if (setting) return parseInt(setting, 10);
  return parseInt(process.env.EMAIL_RETENTION || '3600', 10);
}

/**
 * Get all settings
 */
export function getAllSettings(): Record<string, string> {
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all() as Array<{ key: string; value: string }>;
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);
}

export default db;

