import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertServiceSchema, insertResourceUsageSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get("/api/projects", async (req, res) => {
    try {
      // For demo, use user ID 1
      const userId = 1;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  // Services endpoints
  app.get("/api/projects/:projectId/services", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const services = await storage.getServices(projectId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const updatedService = await storage.updateService(id, serviceData);
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(updatedService);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteService(id);
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  // Resource usage endpoints
  app.get("/api/services/:serviceId/usage", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const usages = await storage.getResourceUsage(serviceId);
      res.json(usages);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/resource-usage", async (req, res) => {
    try {
      const usageData = insertResourceUsageSchema.parse(req.body);
      const usage = await storage.createResourceUsage(usageData);
      res.status(201).json(usage);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Activities endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/users/:userId/activities", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesByUser(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/projects/:projectId/activities", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesByProject(projectId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  // Service health endpoints
  app.get("/api/service-health", async (req, res) => {
    try {
      const statuses = await storage.getServiceHealthStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ message: String(error) });
    }
  });

  app.get("/api/service-health/:type", async (req, res) => {
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
  app.get("/api/overview", async (req, res) => {
    try {
      // For demo, use user ID 1
      const userId = 1;
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
            cpuUsageTotal += latestUsage.cpuUsage;
            memoryUsageTotal += latestUsage.memoryUsage;
            storageUsageTotal += latestUsage.storageUsage;
            networkUsageTotal += latestUsage.networkUsage;
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
