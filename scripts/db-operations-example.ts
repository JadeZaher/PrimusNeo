import { db } from '../server/database';
import { users, projects, services } from '../shared/sqlite-schema';
import { eq, sql } from 'drizzle-orm';

/**
 * This script demonstrates common database operations with the Railway SQLite database
 */
async function demonstrateDatabaseOperations() {
  try {
    console.log('Demonstrating database operations with Railway SQLite...\n');

    // 1. SELECT - Query data
    console.log('1. SELECT - Querying users:');
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);
    if (allUsers.length > 0) {
      console.log('First user:', allUsers[0]);
    }

    // 2. INSERT - Add new data
    console.log('\n2. INSERT - Adding a test project:');
    const testProject = {
      name: 'Test Project',
      status: 'development',
      userId: allUsers.length > 0 ? allUsers[0].id : 1,
      costPerMonth: 0
    };
    
    try {
      const insertedProject = await db.insert(projects).values(testProject).returning();
      console.log('Inserted project:', insertedProject[0]);
      
      // 3. UPDATE - Modify existing data
      console.log('\n3. UPDATE - Modifying the test project:');
      const updatedProject = await db.update(projects)
        .set({ name: 'Updated Test Project', status: 'testing' })
        .where(eq(projects.id, insertedProject[0].id))
        .returning();
      console.log('Updated project:', updatedProject[0]);
      
      // 4. DELETE - Remove data
      console.log('\n4. DELETE - Removing the test project:');
      const deletedProject = await db.delete(projects)
        .where(eq(projects.id, insertedProject[0].id))
        .returning();
      console.log('Deleted project:', deletedProject[0]);
    } catch (error) {
      console.error('Error performing write operations:', error);
      console.log('Note: If you have read-only access to the database, write operations will fail');
    }
    
    // 5. JOIN - Query related data
    console.log('\n5. JOIN - Querying projects with their services:');
    const projectsWithServices = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        projectStatus: projects.status,
        serviceId: services.id,
        serviceName: services.name,
        serviceType: services.type
      })
      .from(projects)
      .leftJoin(services, eq(projects.id, services.projectId))
      .limit(5);
    
    console.log('Projects with services:', projectsWithServices);
    
    // 6. Raw SQL - Execute custom SQL queries
    console.log('\n6. Raw SQL - Executing a custom query:');
    const rawResults = await db.select({
      tableName: sql<string>`name`,
      rowCount: sql<number>`(SELECT count(*) FROM sqlite_master WHERE type = 'table')`
    })
    .from(sql`sqlite_master`)
    .where(sql`type = 'table' AND name NOT LIKE 'sqlite_%'`);
    
    console.log('Database tables and row counts:');
    rawResults.forEach(result => {
      console.log(`- ${result.tableName}: ${result.rowCount} rows`);
    });
    
    console.log('\nDatabase operations demonstration completed!');
  } catch (error) {
    console.error('Error demonstrating database operations:', error);
  }
}

// Run the demonstration
demonstrateDatabaseOperations();
