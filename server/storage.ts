import {
  User,
  InsertUser,
  Project,
  InsertProject,
  ServiceType,
  InsertServiceType,
  Service,
  InsertService,
  Activity,
  InsertActivity,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByOwner(ownerId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Service type operations
  getServiceType(id: number): Promise<ServiceType | undefined>;
  getAllServiceTypes(): Promise<ServiceType[]>;
  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServicesByProject(projectId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByProject(projectId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private serviceTypes: Map<number, ServiceType>;
  private services: Map<number, Service>;
  private activities: Map<number, Activity>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentServiceTypeId: number;
  private currentServiceId: number;
  private currentActivityId: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.serviceTypes = new Map();
    this.services = new Map();
    this.activities = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentServiceTypeId = 1;
    this.currentServiceId = 1;
    this.currentActivityId = 1;
    
    this.initializeData();
  }
  
  // Initialize with some sample data
  private initializeData() {
    // Create default service types
    const serviceTypes: InsertServiceType[] = [
      { name: "Web App", description: "Host web applications and static sites", icon: "ri-chrome-line", color: "#0078D4" },
      { name: "Database", description: "Managed database services", icon: "ri-database-2-line", color: "#10B981" },
      { name: "API", description: "RESTful and GraphQL API services", icon: "ri-code-box-line", color: "#6366F1" },
      { name: "Storage", description: "Object and file storage", icon: "ri-hard-drive-2-line", color: "#F59E0B" },
      { name: "Functions", description: "Serverless event-driven computing", icon: "ri-function-line", color: "#8B5CF6" },
      { name: "CDN", description: "Content delivery network", icon: "ri-global-line", color: "#22C55E" },
    ];
    
    serviceTypes.forEach(type => {
      this.createServiceType(type);
    });
    
    // Create demo user
    const user: InsertUser = {
      username: "demo",
      password: "password123",
      email: "demo@cloudforge.io",
      displayName: "Alex Morgan",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    };
    
    const createdUser = this.createUser(user);
    
    // Create a demo project
    const project: InsertProject = {
      name: "E-commerce Platform",
      description: "Online shopping platform with user accounts and payment processing",
      ownerId: createdUser.id,
    };
    
    const createdProject = this.createProject(project);
    
    // Create some sample services
    const services: InsertService[] = [
      {
        name: "E-commerce Frontend",
        description: "React application with 3 instances",
        projectId: createdProject.id,
        typeId: 1, // Web App
        status: "active",
        cpu: 42,
        memory: 60,
        storage: 35,
        bandwidth: 12,
        connections: null,
      },
      {
        name: "PostgreSQL Cluster",
        description: "High-availability database",
        projectId: createdProject.id,
        typeId: 2, // Database
        status: "active",
        cpu: 28,
        memory: 45,
        storage: 87,
        bandwidth: null,
        connections: 28,
      },
      {
        name: "Product API",
        description: "Node.js backend service",
        projectId: createdProject.id,
        typeId: 3, // API
        status: "active",
        cpu: 22,
        memory: 33,
        storage: 24,
        bandwidth: 43,
        connections: null,
      },
      {
        name: "Cloud Storage",
        description: "Blob and file storage",
        projectId: createdProject.id,
        typeId: 4, // Storage
        status: "active",
        cpu: 12,
        memory: 18,
        storage: 45,
        bandwidth: 32,
        connections: null,
      },
      {
        name: "Serverless Functions",
        description: "Event-driven compute",
        projectId: createdProject.id,
        typeId: 5, // Functions
        status: "active",
        cpu: 31,
        memory: 25,
        storage: 12,
        bandwidth: null,
        connections: null,
      },
      {
        name: "Content Delivery",
        description: "Global CDN distribution",
        projectId: createdProject.id,
        typeId: 6, // CDN
        status: "active",
        cpu: 18,
        memory: 22,
        storage: null,
        bandwidth: 73,
        connections: null,
      },
    ];
    
    services.forEach(service => {
      this.createService(service);
    });
    
    // Create some sample activities
    const activities: InsertActivity[] = [
      {
        type: "deployment",
        title: "Deployment Successful",
        description: "API service deployed to production",
        severity: "success",
        serviceId: 3,
        projectId: createdProject.id,
      },
      {
        type: "alert",
        title: "Resource Warning",
        description: "Database approaching storage limit",
        severity: "warning",
        serviceId: 2,
        projectId: createdProject.id,
      },
      {
        type: "team",
        title: "Team Update",
        description: "Sarah Johnson joined the project",
        severity: "info",
        serviceId: null,
        projectId: createdProject.id,
      },
      {
        type: "config",
        title: "Configuration Change",
        description: "Updated scaling rules for Web Service",
        severity: "info",
        serviceId: 1,
        projectId: createdProject.id,
      },
      {
        type: "incident",
        title: "Incident Resolved",
        description: "Storage service connectivity restored",
        severity: "error",
        serviceId: 4,
        projectId: createdProject.id,
      },
    ];
    
    activities.forEach(activity => {
      this.createActivity(activity);
    });
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
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByOwner(ownerId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.ownerId === ownerId,
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }
  
  // Service type operations
  async getServiceType(id: number): Promise<ServiceType | undefined> {
    return this.serviceTypes.get(id);
  }
  
  async getAllServiceTypes(): Promise<ServiceType[]> {
    return Array.from(this.serviceTypes.values());
  }
  
  async createServiceType(insertServiceType: InsertServiceType): Promise<ServiceType> {
    const id = this.currentServiceTypeId++;
    const serviceType: ServiceType = { ...insertServiceType, id };
    this.serviceTypes.set(id, serviceType);
    return serviceType;
  }
  
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServicesByProject(projectId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.projectId === projectId,
    );
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const now = new Date();
    const service: Service = { ...insertService, id, createdAt: now };
    this.services.set(id, service);
    return service;
  }
  
  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService: Service = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByProject(projectId: number, limit?: number): Promise<Activity[]> {
    let activities = Array.from(this.activities.values())
      .filter((activity) => activity.projectId === projectId)
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    
    if (limit) {
      activities = activities.slice(0, limit);
    }
    
    return activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, timestamp: now };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
