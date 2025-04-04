import { db } from './database';
import { IStorage } from './storage';
import {
  User, InsertUser,
  Project, InsertProject,
  Service, InsertService,
  ResourceUsage, InsertResourceUsage,
  Activity, InsertActivity,
  ServiceHealthStatus, InsertServiceHealthStatus,
  users, projects, services, resourceUsage, activities, serviceHealth,
  formatDate
} from '../shared/sqlite-schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { log } from './vite';

export class SQLiteStorage implements IStorage {
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.id, id));
      return results[0];
    } catch (error) {
      log(`Error getting user: ${error}`, 'db-error');
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.username, username));
      return results[0];
    } catch (error) {
      log(`Error getting user by username: ${error}`, 'db-error');
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const results = await db.insert(users).values(user).returning();
      return results[0];
    } catch (error) {
      log(`Error creating user: ${error}`, 'db-error');
      throw error;
    }
  }

  // Project operations
  async getProjects(userId: number): Promise<Project[]> {
    try {
      const results = await db.select().from(projects).where(eq(projects.userId, userId));
      // Convert string dates to Date objects
      return results.map(project => ({
        ...project,
        createdAt: formatDate(project.createdAt) || new Date(),
        lastDeployed: formatDate(project.lastDeployed)
      }));
    } catch (error) {
      log(`Error getting projects: ${error}`, 'db-error');
      return [];
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const results = await db.select().from(projects).where(eq(projects.id, id));
      if (!results[0]) return undefined;
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        createdAt: formatDate(results[0].createdAt) || new Date(),
        lastDeployed: formatDate(results[0].lastDeployed)
      };
    } catch (error) {
      log(`Error getting project: ${error}`, 'db-error');
      return undefined;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const results = await db.insert(projects).values(project).returning();
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        createdAt: formatDate(results[0].createdAt) || new Date(),
        lastDeployed: formatDate(results[0].lastDeployed)
      };
    } catch (error) {
      log(`Error creating project: ${error}`, 'db-error');
      throw error;
    }
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const results = await db.update(projects)
        .set(updates)
        .where(eq(projects.id, id))
        .returning();
      
      if (!results[0]) return undefined;
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        createdAt: formatDate(results[0].createdAt) || new Date(),
        lastDeployed: formatDate(results[0].lastDeployed)
      };
    } catch (error) {
      log(`Error updating project: ${error}`, 'db-error');
      return undefined;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id));
      return true;
    } catch (error) {
      log(`Error deleting project: ${error}`, 'db-error');
      return false;
    }
  }

  // Service operations
  async getServices(projectId: number): Promise<Service[]> {
    try {
      const results = await db.select().from(services).where(eq(services.projectId, projectId));
      
      // Convert string dates to Date objects and parse config
      return results.map(service => ({
        ...service,
        createdAt: formatDate(service.createdAt) || new Date(),
        config: typeof service.config === 'string' ? JSON.parse(service.config) : service.config
      }));
    } catch (error) {
      log(`Error getting services: ${error}`, 'db-error');
      return [];
    }
  }

  async getService(id: number): Promise<Service | undefined> {
    try {
      const results = await db.select().from(services).where(eq(services.id, id));
      if (!results[0]) return undefined;
      
      // Convert string dates to Date objects and parse config
      return {
        ...results[0],
        createdAt: formatDate(results[0].createdAt) || new Date(),
        config: typeof results[0].config === 'string' ? JSON.parse(results[0].config as string) : results[0].config
      };
    } catch (error) {
      log(`Error getting service: ${error}`, 'db-error');
      return undefined;
    }
  }

  async createService(service: InsertService): Promise<Service> {
    try {
      // For SQLite, we need to stringify the JSON config since SQLite doesn't have a JSON type
      const serviceWithStringConfig = {
        ...service,
        config: typeof service.config === 'string' ? service.config : JSON.stringify(service.config)
      };
      
      const results = await db.insert(services).values(serviceWithStringConfig).returning();
      
      // Parse the config back to an object if it's a string and convert date string to Date
      const result = {
        ...results[0],
        createdAt: formatDate(results[0].createdAt) || new Date(),
        config: typeof results[0].config === 'string' ? JSON.parse(results[0].config as string) : results[0].config
      };
      
      return result;
    } catch (error) {
      log(`Error creating service: ${error}`, 'db-error');
      throw error;
    }
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined> {
    try {
      // If config is provided in updates and it's not a string, convert it to string
      let updatesToApply = updates;
      if (updates.config && typeof updates.config !== 'string') {
        updatesToApply = {
          ...updates,
          config: JSON.stringify(updates.config)
        };
      }
      
      const results = await db.update(services)
        .set(updatesToApply)
        .where(eq(services.id, id))
        .returning();
      
      if (!results[0]) return undefined;
      
      // Convert string dates to Date objects and parse config
      return {
        ...results[0],
        createdAt: formatDate(results[0].createdAt) || new Date(),
        config: typeof results[0].config === 'string' ? JSON.parse(results[0].config as string) : results[0].config
      };
    } catch (error) {
      log(`Error updating service: ${error}`, 'db-error');
      return undefined;
    }
  }

  async deleteService(id: number): Promise<boolean> {
    try {
      await db.delete(services).where(eq(services.id, id));
      return true;
    } catch (error) {
      log(`Error deleting service: ${error}`, 'db-error');
      return false;
    }
  }

  // Resource usage operations
  async getResourceUsage(serviceId: number): Promise<ResourceUsage[]> {
    try {
      const results = await db.select()
        .from(resourceUsage)
        .where(eq(resourceUsage.serviceId, serviceId))
        .orderBy(desc(resourceUsage.timestamp));
      
      // Convert string dates to Date objects
      return results.map(usage => ({
        ...usage,
        timestamp: formatDate(usage.timestamp) || new Date()
      }));
    } catch (error) {
      log(`Error getting resource usage: ${error}`, 'db-error');
      return [];
    }
  }

  async createResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage> {
    try {
      const results = await db.insert(resourceUsage).values(usage).returning();
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        timestamp: formatDate(results[0].timestamp) || new Date()
      };
    } catch (error) {
      log(`Error creating resource usage: ${error}`, 'db-error');
      throw error;
    }
  }

  // Activity operations
  async getActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const results = await db.select()
        .from(activities)
        .orderBy(desc(activities.timestamp))
        .limit(limit);
      
      // Convert string dates to Date objects
      return results.map(activity => ({
        ...activity,
        timestamp: formatDate(activity.timestamp) || new Date()
      }));
    } catch (error) {
      log(`Error getting activities: ${error}`, 'db-error');
      return [];
    }
  }

  async getActivitiesByUser(userId: number, limit: number = 10): Promise<Activity[]> {
    try {
      const results = await db.select()
        .from(activities)
        .where(eq(activities.userId, userId))
        .orderBy(desc(activities.timestamp))
        .limit(limit);
      
      // Convert string dates to Date objects
      return results.map(activity => ({
        ...activity,
        timestamp: formatDate(activity.timestamp) || new Date()
      }));
    } catch (error) {
      log(`Error getting user activities: ${error}`, 'db-error');
      return [];
    }
  }

  async getActivitiesByProject(projectId: number, limit: number = 10): Promise<Activity[]> {
    try {
      const results = await db.select()
        .from(activities)
        .where(eq(activities.projectId, projectId))
        .orderBy(desc(activities.timestamp))
        .limit(limit);
      
      // Convert string dates to Date objects
      return results.map(activity => ({
        ...activity,
        timestamp: formatDate(activity.timestamp) || new Date()
      }));
    } catch (error) {
      log(`Error getting project activities: ${error}`, 'db-error');
      return [];
    }
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    try {
      const results = await db.insert(activities).values(activity).returning();
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        timestamp: formatDate(results[0].timestamp) || new Date()
      };
    } catch (error) {
      log(`Error creating activity: ${error}`, 'db-error');
      throw error;
    }
  }

  // Service health operations
  async getServiceHealthStatuses(): Promise<ServiceHealthStatus[]> {
    try {
      const results = await db.select().from(serviceHealth);
      
      // Convert string dates to Date objects
      return results.map(health => ({
        ...health,
        lastUpdated: formatDate(health.lastUpdated) || new Date()
      }));
    } catch (error) {
      log(`Error getting service health statuses: ${error}`, 'db-error');
      return [];
    }
  }

  async getServiceHealthStatus(serviceType: string): Promise<ServiceHealthStatus | undefined> {
    try {
      const results = await db.select()
        .from(serviceHealth)
        .where(eq(serviceHealth.serviceType, serviceType));
      
      if (!results[0]) return undefined;
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        lastUpdated: formatDate(results[0].lastUpdated) || new Date()
      };
    } catch (error) {
      log(`Error getting service health status: ${error}`, 'db-error');
      return undefined;
    }
  }

  async createServiceHealthStatus(status: InsertServiceHealthStatus): Promise<ServiceHealthStatus> {
    try {
      const results = await db.insert(serviceHealth).values(status).returning();
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        lastUpdated: formatDate(results[0].lastUpdated) || new Date()
      };
    } catch (error) {
      log(`Error creating service health status: ${error}`, 'db-error');
      throw error;
    }
  }

  async updateServiceHealthStatus(serviceType: string, updates: Partial<InsertServiceHealthStatus>): Promise<ServiceHealthStatus | undefined> {
    try {
      const results = await db.update(serviceHealth)
        .set(updates)
        .where(eq(serviceHealth.serviceType, serviceType))
        .returning();
      
      if (!results[0]) return undefined;
      
      // Convert string dates to Date objects
      return {
        ...results[0],
        lastUpdated: formatDate(results[0].lastUpdated) || new Date()
      };
    } catch (error) {
      log(`Error updating service health status: ${error}`, 'db-error');
      return undefined;
    }
  }

  // Seed the database with initial data
  async seedDatabase(): Promise<void> {
    try {
      log('Seeding database with initial data...', 'database');
      
      // Check if we already have data
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      if (userCount[0].count > 0) {
        log('Database already seeded, skipping...', 'database');
        return;
      }
      
      // Add default admin user
      const defaultUser: InsertUser = {
        username: 'admin',
        password: 'adminpass', // In a real app, this would be hashed
        fullName: 'Admin User',
        role: 'admin',
        avatar: null
      };
      
      const user = await this.createUser(defaultUser);
      
      // Add sample projects
      const project1 = await this.createProject({
        name: 'E-commerce Platform',
        status: 'production',
        userId: user.id,
        costPerMonth: 129.99
      });
      
      const project2 = await this.createProject({
        name: 'Analytics Dashboard',
        status: 'development',
        userId: user.id,
        costPerMonth: 79.50
      });
      
      // Add sample services
      await this.createService({
        name: 'Product Database',
        type: 'database',
        status: 'active',
        projectId: project1.id,
        config: { engine: 'postgres', size: 'medium', replicas: 1 }
      });
      
      await this.createService({
        name: 'Web Server',
        type: 'compute',
        status: 'active',
        projectId: project1.id,
        config: { cpu: 2, memory: '4GB', scaling: 'auto' }
      });
      
      await this.createService({
        name: 'Customer Data Store',
        type: 'storage',
        status: 'active',
        projectId: project1.id,
        config: { type: 'object', redundancy: 'high' }
      });
      
      await this.createService({
        name: 'User Authentication',
        type: 'web3',
        status: 'active',
        projectId: project1.id,
        config: { provider: 'oasis', features: ['sso', 'mfa', 'passwordless'] }
      });
      
      await this.createService({
        name: 'Product Visualization',
        type: '3d_amp',
        status: 'active',
        projectId: project1.id,
        config: { renderer: 'webgl', quality: 'high' }
      });
      
      await this.createService({
        name: 'Store Locator',
        type: 'spatial',
        status: 'active',
        projectId: project1.id,
        config: { provider: 'mapbox', features: ['routing', 'geocoding'] }
      });
      
      // Add service health status
      const serviceTypes = ['database', 'compute', 'storage', 'functions', 'network', 'web3', 'spatial', '3d_amp'];
      
      for (const type of serviceTypes) {
        await this.createServiceHealthStatus({
          serviceType: type,
          status: 'operational',
          uptime: 99.98
        });
      }
      
      // Add activities
      await this.createActivity({
        type: 'project_created',
        message: 'E-commerce Platform project created',
        userId: user.id,
        projectId: project1.id,
        serviceId: null
      });
      
      await this.createActivity({
        type: 'deployment',
        message: 'Web Server successfully deployed',
        userId: user.id,
        projectId: project1.id,
        serviceId: 2
      });
      
      await this.createActivity({
        type: 'alert',
        message: 'High database CPU usage detected',
        userId: null,
        projectId: project1.id,
        serviceId: 1
      });
      
      log('Database seeded successfully', 'database');
    } catch (error) {
      log(`Error seeding database: ${error}`, 'db-error');
    }
  }
}