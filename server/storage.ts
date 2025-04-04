import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  services, type Service, type InsertService,
  resourceUsage, type ResourceUsage, type InsertResourceUsage,
  activities, type Activity, type InsertActivity,
  serviceHealth, type ServiceHealthStatus, type InsertServiceHealthStatus
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Service operations
  getServices(projectId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Resource usage operations
  getResourceUsage(serviceId: number): Promise<ResourceUsage[]>;
  createResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage>;
  
  // Activity operations
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByUser(userId: number, limit?: number): Promise<Activity[]>;
  getActivitiesByProject(projectId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Service health operations
  getServiceHealthStatuses(): Promise<ServiceHealthStatus[]>;
  getServiceHealthStatus(serviceType: string): Promise<ServiceHealthStatus | undefined>;
  createServiceHealthStatus(status: InsertServiceHealthStatus): Promise<ServiceHealthStatus>;
  updateServiceHealthStatus(serviceType: string, updates: Partial<InsertServiceHealthStatus>): Promise<ServiceHealthStatus | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private services: Map<number, Service>;
  private resourceUsages: Map<number, ResourceUsage>;
  private activities: Map<number, Activity>;
  private serviceHealthStatuses: Map<string, ServiceHealthStatus>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentServiceId: number;
  private currentResourceUsageId: number;
  private currentActivityId: number;
  private currentServiceHealthId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.services = new Map();
    this.resourceUsages = new Map();
    this.activities = new Map();
    this.serviceHealthStatuses = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentServiceId = 1;
    this.currentResourceUsageId = 1;
    this.currentActivityId = 1;
    this.currentServiceHealthId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project operations
  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now,
      lastDeployed: null
    };
    this.projects.set(id, project);
    
    // Create activity
    this.createActivity({
      type: "project_created",
      message: `Project "${project.name}" created`,
      userId: project.userId,
      projectId: project.id,
      serviceId: null
    });
    
    return project;
  }
  
  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // Service operations
  async getServices(projectId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.projectId === projectId
    );
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const now = new Date();
    const service: Service = { 
      ...insertService, 
      id, 
      createdAt: now
    };
    this.services.set(id, service);
    
    // Create activity
    const project = this.projects.get(service.projectId);
    this.createActivity({
      type: "service_created",
      message: `Service "${service.name}" created for project "${project?.name}"`,
      userId: project?.userId,
      projectId: service.projectId,
      serviceId: service.id
    });
    
    return service;
  }
  
  async updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
  
  // Resource usage operations
  async getResourceUsage(serviceId: number): Promise<ResourceUsage[]> {
    return Array.from(this.resourceUsages.values()).filter(
      (usage) => usage.serviceId === serviceId
    );
  }
  
  async createResourceUsage(insertUsage: InsertResourceUsage): Promise<ResourceUsage> {
    const id = this.currentResourceUsageId++;
    const now = new Date();
    const usage: ResourceUsage = { 
      ...insertUsage, 
      id, 
      timestamp: now
    };
    this.resourceUsages.set(id, usage);
    return usage;
  }
  
  // Activity operations
  async getActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async getActivitiesByUser(userId: number, limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async getActivitiesByProject(projectId: number, limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      timestamp: now
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Service health operations
  async getServiceHealthStatuses(): Promise<ServiceHealthStatus[]> {
    return Array.from(this.serviceHealthStatuses.values());
  }
  
  async getServiceHealthStatus(serviceType: string): Promise<ServiceHealthStatus | undefined> {
    return this.serviceHealthStatuses.get(serviceType);
  }
  
  async createServiceHealthStatus(insertStatus: InsertServiceHealthStatus): Promise<ServiceHealthStatus> {
    const id = this.currentServiceHealthId++;
    const now = new Date();
    const status: ServiceHealthStatus = { 
      ...insertStatus, 
      id, 
      lastUpdated: now
    };
    this.serviceHealthStatuses.set(status.serviceType, status);
    return status;
  }
  
  async updateServiceHealthStatus(serviceType: string, updates: Partial<InsertServiceHealthStatus>): Promise<ServiceHealthStatus | undefined> {
    const status = this.serviceHealthStatuses.get(serviceType);
    if (!status) return undefined;
    
    const now = new Date();
    const updatedStatus = { 
      ...status, 
      ...updates, 
      lastUpdated: now 
    };
    this.serviceHealthStatuses.set(serviceType, updatedStatus);
    
    return updatedStatus;
  }

  // Initialize with default data
  private initializeDefaultData() {
    // Create a default user
    const defaultUser: InsertUser = {
      username: "sarah",
      password: "password123",
      fullName: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "developer"
    };
    const user = this.createUser(defaultUser);

    // Initialize service health statuses
    const serviceTypes = [
      "Compute Services", 
      "Database Services", 
      "Storage Services", 
      "Networking", 
      "Authentication", 
      "CI/CD Pipeline",
      "Web3 Identity Services (Oasis)",
      "Spatial Services",
      "3D Services (AMP)"
    ];
    
    serviceTypes.forEach(type => {
      const status = type === "Networking" ? "degraded" : "operational";
      this.createServiceHealthStatus({
        serviceType: type,
        status: status,
        uptime: type === "Networking" ? 98.5 : 100
      });
    });

    // Create sample projects
    const projects = [
      {
        name: "E-commerce Backend",
        status: "production",
        costPerMonth: 45.80,
        userId: 1
      },
      {
        name: "Marketing Website",
        status: "production",
        costPerMonth: 12.40,
        userId: 1
      },
      {
        name: "Analytics Platform",
        status: "development",
        costPerMonth: 78.20,
        userId: 1
      }
    ];
    
    projects.forEach(async (proj) => {
      this.createProject(proj);
    });

    // Create sample services
    const services = [
      {
        name: "API Server",
        type: "compute",
        status: "active",
        projectId: 1,
        config: { size: "medium", region: "us-west" }
      },
      {
        name: "PostgreSQL Database",
        type: "database",
        status: "active",
        projectId: 1,
        config: { size: "medium", version: "13" }
      },
      {
        name: "Redis Cache",
        type: "database",
        status: "active",
        projectId: 1,
        config: { size: "small" }
      },
      {
        name: "Static Website",
        type: "storage",
        status: "active",
        projectId: 2,
        config: { cdn: true }
      },
      {
        name: "Analytics API",
        type: "compute",
        status: "active",
        projectId: 3,
        config: { size: "large", region: "us-east" }
      },
      {
        name: "TimeSeries Database",
        type: "database",
        status: "active",
        projectId: 3,
        config: { size: "large", version: "latest" }
      },
      {
        name: "Oasis Identity Provider",
        type: "web3",
        status: "active",
        projectId: 1,
        config: { version: "1.0", blockchain: "ethereum", features: ["sign-in", "key-management"] }
      },
      {
        name: "Spatial Mapping Service",
        type: "spatial",
        status: "active",
        projectId: 2,
        config: { region: "global", features: ["geo-mapping", "coordinate-indexing"] }
      },
      {
        name: "AMP 3D Rendering Engine",
        type: "3d_amp",
        status: "active",
        projectId: 3,
        config: { gpu: "high-performance", features: ["real-time", "physics-engine"] }
      }
    ];
    
    services.forEach(async (svc) => {
      this.createService(svc);
    });

    // Create sample resource usages
    for (let i = 1; i <= 9; i++) {
      this.createResourceUsage({
        serviceId: i,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        storageUsage: Math.random() * 100,
        networkUsage: Math.random() * 100
      });
    }

    // Create sample activities
    const activities = [
      {
        type: "alert",
        message: "Network Latency Alert: High latency detected in US-West region",
        userId: 1,
        projectId: null,
        serviceId: null
      },
      {
        type: "deployment",
        message: "Deployment Completed: E-commerce Backend deployed successfully",
        userId: 1,
        projectId: 1,
        serviceId: null
      },
      {
        type: "database",
        message: "Database Created: New PostgreSQL database provisioned",
        userId: 1,
        projectId: 1,
        serviceId: 2
      },
      {
        type: "billing",
        message: "Billing Update: Monthly invoice generated: $278.45",
        userId: 1,
        projectId: null,
        serviceId: null
      },
      {
        type: "service_created",
        message: "Web3 Identity Service (Oasis) created successfully",
        userId: 1,
        projectId: 1,
        serviceId: 7
      },
      {
        type: "service_created",
        message: "Spatial Mapping Service deployed successfully",
        userId: 1,
        projectId: 2,
        serviceId: 8
      },
      {
        type: "service_created",
        message: "AMP 3D Rendering Engine provisioned successfully",
        userId: 1,
        projectId: 3,
        serviceId: 9
      }
    ];
    
    activities.forEach(async (activity) => {
      this.createActivity(activity);
    });
  }
}

export const storage = new MemStorage();
