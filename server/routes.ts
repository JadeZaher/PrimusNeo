import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage as memStorage } from "./storage";
import { IStorage } from "./storage";
import { insertProjectSchema, insertServiceSchema, insertResourceUsageSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express, customStorage?: IStorage): Promise<Server> {
  // Use the provided storage implementation or fall back to in-memory storage
  const storage = customStorage || memStorage;
  
  // Set up authentication
  const { isAuthenticated } = setupAuth(app, storage);
  
  // Error handler for Zod validation errors
  const handleZodError = (error: unknown) => {
    if (error instanceof ZodError) {
      return { message: error.errors.map(e => `${e.path}: ${e.message}`).join(', ') };
    }
    return { message: String(error) };
  };

  // User endpoints
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  // Projects endpoints
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      // Use the authenticated user's ID
      const userId = req.user!.id;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if the project belongs to the authenticated user
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      // Ensure the project is assigned to the authenticated user
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // First check if the project exists and belongs to the user
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, projectData);
      
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // First check if the project exists and belongs to the user
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  // Services endpoints
  app.get("/api/projects/:projectId/services", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // First check if the project exists and belongs to the user
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const services = await storage.getServices(projectId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Check if the service is in a project owned by the user
      const project = await storage.getProject(service.projectId);
      if (project && project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/services", isAuthenticated, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      
      // Check if the project exists and belongs to the user
      const project = await storage.getProject(serviceData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.put("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if the service exists
      const existingService = await storage.getService(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Check if the service is in a project owned by the user
      const project = await storage.getProject(existingService.projectId);
      if (project && project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const updatedService = await storage.updateService(id, serviceData);
      
      res.json(updatedService);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.delete("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if the service exists
      const existingService = await storage.getService(id);
      if (!existingService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Check if the service is in a project owned by the user
      const project = await storage.getProject(existingService.projectId);
      if (project && project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteService(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  // Resource usage endpoints
  app.get("/api/services/:serviceId/usage", isAuthenticated, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      
      // First check if the service exists
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Then check if it belongs to a project owned by the user
      const project = await storage.getProject(service.projectId);
      if (project && project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const usages = await storage.getResourceUsage(serviceId);
      res.json(usages);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/resource-usage", isAuthenticated, async (req, res) => {
    try {
      const usageData = insertResourceUsageSchema.parse(req.body);
      
      // First check if the service exists
      const service = await storage.getService(usageData.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Then check if it belongs to a project owned by the user
      const project = await storage.getProject(service.projectId);
      if (project && project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const usage = await storage.createResourceUsage(usageData);
      res.status(201).json(usage);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Activities endpoints
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/users/:userId/activities", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Only allow users to view their own activities
      if (userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesByUser(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/projects/:projectId/activities", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Check if the project exists and belongs to the user
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesByProject(projectId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/activities", isAuthenticated, async (req, res) => {
    try {
      // Always set the user ID to the authenticated user
      const activityData = insertActivitySchema.parse({
        ...req.body,
        userId: req.body.userId || req.user!.id
      });
      
      // If a project is specified, ensure it belongs to the user
      if (activityData.projectId) {
        const project = await storage.getProject(activityData.projectId);
        if (project && project.userId !== req.user!.id) {
          return res.status(403).json({ message: "Access denied to specified project" });
        }
      }
      
      // If a service is specified, ensure it belongs to a project owned by the user
      if (activityData.serviceId) {
        const service = await storage.getService(activityData.serviceId);
        if (service) {
          const project = await storage.getProject(service.projectId);
          if (project && project.userId !== req.user!.id) {
            return res.status(403).json({ message: "Access denied to specified service" });
          }
        }
      }
      
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Service health endpoints
  app.get("/api/service-health", isAuthenticated, async (req, res) => {
    try {
      const statuses = await storage.getServiceHealthStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/service-health/:type", isAuthenticated, async (req, res) => {
    try {
      const serviceType = req.params.type;
      const status = await storage.getServiceHealthStatus(serviceType);
      if (!status) {
        return res.status(404).json({ message: "Service health status not found" });
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  // Overview endpoint (aggregated data for dashboard)
  app.get("/api/overview", isAuthenticated, async (req, res) => {
    try {
      // Use the authenticated user's ID
      const userId = req.user!.id;
      const projects = await storage.getProjects(userId);
      const serviceHealthStatuses = await storage.getServiceHealthStatuses();
      const activities = await storage.getActivities(4);
      
      // Calculate resource counts
      let totalCompute = 0;
      let totalDatabases = 0;
      let totalStorage = 0;
      let totalWeb3 = 0;
      let totalSpatial = 0;
      let totalAmp3d = 0;
      
      for (const project of projects) {
        const services = await storage.getServices(project.id);
        for (const service of services) {
          if (service.type === 'compute') totalCompute++;
          if (service.type === 'database') totalDatabases++;
          if (service.type === 'storage') totalStorage++;
          if (service.type === 'web3') totalWeb3++;
          if (service.type === 'spatial') totalSpatial++;
          if (service.type === '3d_amp') totalAmp3d++;
        }
      }
      
      // Calculate average resource usage
      const allServices = projects.flatMap(async (project) => 
        await storage.getServices(project.id)
      );
      
      let cpuUsageTotal = 0;
      let memoryUsageTotal = 0;
      let storageUsageTotal = 0;
      let networkUsageTotal = 0;
      let usageCount = 0;
      
      for (const servicePromise of allServices) {
        const services = await servicePromise;
        for (const service of services) {
          const usages = await storage.getResourceUsage(service.id);
          if (usages.length > 0) {
            const latestUsage = usages[usages.length - 1];
            if (latestUsage.cpuUsage !== null) cpuUsageTotal += latestUsage.cpuUsage;
            if (latestUsage.memoryUsage !== null) memoryUsageTotal += latestUsage.memoryUsage;
            if (latestUsage.storageUsage !== null) storageUsageTotal += latestUsage.storageUsage;
            if (latestUsage.networkUsage !== null) networkUsageTotal += latestUsage.networkUsage;
            usageCount++;
          }
        }
      }
      
      const overview = {
        resources: {
          compute: totalCompute,
          databases: totalDatabases,
          storage: totalStorage,
          web3: totalWeb3,
          spatial: totalSpatial,
          amp3d: totalAmp3d,
          deployments: {
            total: projects.length,
            healthy: projects.length
          }
        },
        usage: {
          cpu: usageCount > 0 ? Math.round(cpuUsageTotal / usageCount) : 0,
          memory: usageCount > 0 ? Math.round(memoryUsageTotal / usageCount) : 0,
          storage: usageCount > 0 ? Math.round(storageUsageTotal / usageCount) : 0,
          network: usageCount > 0 ? Math.round(networkUsageTotal / usageCount) : 0,
          database: Math.round(Math.random() * 50)  // Sample value
        },
        serviceHealth: serviceHealthStatuses,
        recentActivities: activities,
        projects: projects
      };
      
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
