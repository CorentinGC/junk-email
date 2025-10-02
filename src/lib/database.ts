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
    email_count INTEGER DEFAULT 0,
    last_email_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_address ON addresses(address);
  CREATE INDEX IF NOT EXISTS idx_created_at ON addresses(created_at DESC);
`);

// Migration: Check if expires_at column exists (legacy)
try {
  const tableInfo = db.pragma('table_info(addresses)');
  const hasExpiresAt = (tableInfo as any[]).some((col: any) => col.name === 'expires_at');
  
  if (hasExpiresAt) {
    console.log('[Database] Migration: addresses are now permanent (expires_at column ignored)');
  }
} catch (error) {
  console.error('[Database] Error checking table schema:', error);
}

console.log('[Database] Initialized:', DB_FILE);

/**
 * Save address to database (permanent, no expiration)
 */
export function saveAddress(address: string, createdAt: number): void {
  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO addresses (address, created_at)
      VALUES (?, ?)
    `);
    const result = stmt.run(address, createdAt);
    console.log('[Database] saveAddress:', address, 'changes:', result.changes);
  } catch (error) {
    console.error('[Database] Error saving address:', error);
    throw error;
  }
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
 * Decrement email count for address
 * @param {string} address - Email address
 */
export function decrementEmailCount(address: string): void {
  const stmt = db.prepare(`
    UPDATE addresses
    SET email_count = CASE 
      WHEN email_count > 0 THEN email_count - 1 
      ELSE 0 
    END
    WHERE address = ?
  `);
  stmt.run(address);
  console.log('[Database] Decremented email count for', address);
}

/**
 * Reset email count for address to 0
 * @param {string} address - Email address
 */
export function resetEmailCount(address: string): void {
  const stmt = db.prepare(`
    UPDATE addresses
    SET email_count = 0,
        last_email_at = NULL
    WHERE address = ?
  `);
  stmt.run(address);
  console.log('[Database] Reset email count for', address);
}

/**
 * Get all addresses with pagination (permanent addresses)
 */
export function getAllAddresses(limit = 50, offset = 0): Array<{
  id: number;
  address: string;
  created_at: number;
  email_count: number;
  last_email_at: number | null;
}> {
  const stmt = db.prepare(`
    SELECT id, address, created_at, email_count, last_email_at
    FROM addresses
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  const results = stmt.all(limit, offset) as any[];
  console.log('[Database] getAllAddresses: found', results.length, 'addresses', results.map(r => r.address));
  return results;
}

/**
 * Get address by value
 */
export function getAddressByValue(address: string): {
  id: number;
  address: string;
  created_at: number;
  email_count: number;
  last_email_at: number | null;
} | null {
  const stmt = db.prepare('SELECT id, address, created_at, email_count, last_email_at FROM addresses WHERE address = ?');
  return stmt.get(address) as any;
}

/**
 * Get statistics (addresses are now permanent)
 */
export function getStats(): {
  total_addresses: number;
  total_emails: number;
} {
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_addresses,
      SUM(email_count) as total_emails
    FROM addresses
  `);
  return stmt.get() as any;
}

/**
 * Delete specific address from database
 * @param {string} address - Email address to delete
 * @returns {number} Number of rows deleted
 */
export function deleteAddress(address: string): number {
  const stmt = db.prepare('DELETE FROM addresses WHERE address = ?');
  const result = stmt.run(address);
  return result.changes;
}

/**
 * Get email retention in seconds from environment variable
 * Default: 365 days
 */
export function getEmailRetention(): number {
  const days = parseInt(process.env.EMAIL_RETENTION_DAYS || '365', 10);
  return days * 24 * 60 * 60; // Convert days to seconds
}

export default db;

