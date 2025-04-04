import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/sqlite-schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { log } from './vite';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const sqlite = new Database(path.join(dbDir, 'cloudhub.db'));
export const db = drizzle(sqlite, { schema });

// Initialize the database with tables and migrations
export function initDatabase() {
  try {
    log('Initializing database...', 'database');
    
    // Run migrations
    // Note: In production, you'd want to create migrations using drizzle-kit
    // For now, we'll just create the tables directly
    
    // Create tables from schema
    const tables = Object.values(schema)
      .filter(value => typeof value === 'object' && 'name' in value)
      .map(table => table.name);
    
    log(`Creating tables if they don't exist: ${tables.join(', ')}`, 'database');
    
    // Execute migrations - run each statement separately
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('synchronous = NORMAL');
    
    // Create tables individually
    sqlite.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'user'
      );
    `);
    
    sqlite.exec(`
      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'development',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_deployed TEXT,
        cost_per_month REAL DEFAULT 0,
        user_id INTEGER NOT NULL
      );
    `);
    
    sqlite.exec(`
      -- Services table
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        project_id INTEGER NOT NULL,
        config TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    sqlite.exec(`
      -- Resource usage table
      CREATE TABLE IF NOT EXISTS resource_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        cpu_usage REAL DEFAULT 0,
        memory_usage REAL DEFAULT 0,
        storage_usage REAL DEFAULT 0,
        network_usage REAL DEFAULT 0,
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    sqlite.exec(`
      -- Activities table
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        user_id INTEGER,
        project_id INTEGER,
        service_id INTEGER,
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    sqlite.exec(`
      -- Service health table
      CREATE TABLE IF NOT EXISTS service_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'operational',
        uptime REAL DEFAULT 100,
        last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    log('Database initialized successfully', 'database');
    return true;
  } catch (error) {
    log(`Database initialization error: ${error}`, 'database');
    return false;
  }
}

// Helper function to run SQL directly for migrations and setup
export function runSQL(sql: string) {
  return sqlite.exec(sql);
}