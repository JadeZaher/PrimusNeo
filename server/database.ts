import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { log } from './vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('Database configuration missing. Please check your .env file.');
}

// Initialize PostgreSQL connection
let connectionString = process.env.DATABASE_URL;



// Configure postgres client with additional options
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds a client can be idle before being closed
  connect_timeout: 10, // Max seconds to wait for connection
});

export const db = drizzle(client, { schema });

// Initialize the database with tables and migrations
export async function initDatabase() {
  try {
    log('Initializing database...', 'database');
    
    // In a production environment, you would use migrations
    // For development, we can use the schema to create tables
    
    // List tables from schema
    const tables = Object.values(schema)
      .filter(value => typeof value === 'object' && 'name' in value)
      .map(table => table.name);
    
    log(`Tables defined in schema: ${tables.join(', ')}`, 'database');
    
    // For proper migrations, you should use drizzle-kit
    // migrate(db, { migrationsFolder: './migrations' });
    
    log('Database initialized successfully', 'database');
    return true;
  } catch (error) {
    log(`Database initialization error: ${error}`, 'database');
    return false;
  }
}

// Helper function to run SQL directly
export async function runSQL(sql: string) {
  return client.unsafe(sql);
}
