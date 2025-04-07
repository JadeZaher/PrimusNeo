import { db, runSQL } from '../server/database';
import { users } from '../shared/schema';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Testing connection to PostgreSQL database...');
    console.log(`Connection string: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    // Test 1: Run a simple query to check if the connection works
    console.log('\nTest 1: Running a simple query...');
    try {
      const result = await db.select().from(users).limit(1);
      console.log('Query result:', result);
    } catch (e) {
      console.log('Query error:', e);
    }
    
    // Test 2: Get the list of tables in the database
    console.log('\nTest 2: Getting list of tables...');
    try {
      const tableInfo = await runSQL('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
      console.log('Tables in database:', tableInfo);
    } catch (e) {
      console.log('Error getting table info:', e);
    }
    
    // Test 3: Get the list of tables using raw SQL
    console.log('\nTest 3: Getting list of tables using SQL...');
    try {
      const tables = await db.select({ name: sql<string>`table_name` })
        .from(sql`information_schema.tables`)
        .where(sql`table_schema = 'public'`);
      console.log('Tables in database:', tables);
    } catch (e) {
      console.log('Error executing SQL:', e);
    }
    
    console.log('\nConnection test completed!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Run the test
testDatabaseConnection();
