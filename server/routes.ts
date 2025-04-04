import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertProjectSchema,
  insertServiceSchema,
  insertActivitySchema,
  serviceStatusSchema,
  activityTypeSchema,
  severitySchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (demo)
  app.get("/api/user", async (req: Request, res: Response) => {
    const user = await storage.getUserByUsername("demo");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });
  
  // Get projects for a user
  app.get("/api/projects", async (req: Request, res: Response) => {
    const user = await storage.getUserByUsername("demo");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const projects = await storage.getProjectsByOwner(user.id);
    return res.json(projects);
  });
  
  // Create a new project
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        ownerId: user.id,
      });
      
      const project = await storage.createProject(projectData);
      return res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  // Get service types
  app.get("/api/service-types", async (req: Request, res: Response) => {
    const serviceTypes = await storage.getAllServiceTypes();
    return res.json(serviceTypes);
  });
  
  // Get services for a project
  app.get("/api/projects/:projectId/services", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId, 10);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const services = await storage.getServicesByProject(projectId);
    
    // Enhance services with their type information
    const enhancedServices = await Promise.all(
      services.map(async (service) => {
        const serviceType = await storage.getServiceType(service.typeId);
        return {
          ...service,
          type: serviceType,
        };
      })
    );
    
    return res.json(enhancedServices);
  });
  
  // Create a new service
  app.post("/api/projects/:projectId/services", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Validate status
      const status = serviceStatusSchema.parse(req.body.status);
      
      const serviceData = insertServiceSchema.parse({
        ...req.body,
        projectId,
      });
      
      const service = await storage.createService(serviceData);
      
      // Create activity for the new service
      await storage.createActivity({
        type: "deployment",
        title: "Service Created",
        description: `${service.name} service has been created`,
        severity: "success",
        serviceId: service.id,
        projectId,
      });
      
      return res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create service" });
    }
  });
  
  // Update a service
  app.patch("/api/services/:serviceId", async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.serviceId, 10);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const service = await storage.getService(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // If status is provided, validate it
      if (req.body.status) {
        serviceStatusSchema.parse(req.body.status);
      }
      
      const updatedService = await storage.updateService(serviceId, req.body);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Create activity for the service update
      await storage.createActivity({
        type: "config",
        title: "Service Updated",
        description: `${updatedService.name} service has been updated`,
        severity: "info",
        serviceId: updatedService.id,
        projectId: updatedService.projectId,
      });
      
      return res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to update service" });
    }
  });
  
  // Get activities for a project
  app.get("/api/projects/:projectId/activities", async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId, 10);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const activities = await storage.getActivitiesByProject(projectId, limit);
    
    // Enhance activities with service information if available
    const enhancedActivities = await Promise.all(
      activities.map(async (activity) => {
        if (activity.serviceId) {
          const service = await storage.getService(activity.serviceId);
          if (service) {
            return {
              ...activity,
              service: {
                id: service.id,
                name: service.name,
              },
            };
          }
        }
        return activity;
      })
    );
    
    return res.json(enhancedActivities);
  });
  
  // Create a new activity
  app.post("/api/projects/:projectId/activities", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Validate type and severity
      const type = activityTypeSchema.parse(req.body.type);
      const severity = severitySchema.parse(req.body.severity);
      
      const activityData = insertActivitySchema.parse({
        ...req.body,
        projectId,
      });
      
      const activity = await storage.createActivity(activityData);
      return res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create activity" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
