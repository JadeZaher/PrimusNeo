import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatarUrl: true,
});

// Projects model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  ownerId: true,
});

// Service types
export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).pick({
  name: true,
  description: true,
  icon: true,
  color: true,
});

// Services model
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  projectId: integer("project_id").notNull(),
  typeId: integer("type_id").notNull(),
  status: text("status").notNull(), // active, stopped, error
  cpu: integer("cpu"), // percentage
  memory: integer("memory"), // percentage
  storage: integer("storage"), // percentage
  bandwidth: integer("bandwidth"), // MB/s
  connections: integer("connections"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  description: true,
  projectId: true,
  typeId: true,
  status: true,
  cpu: true,
  memory: true,
  storage: true,
  bandwidth: true,
  connections: true,
});

// Activities model
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // deployment, alert, config, team, incident
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(), // success, warning, error, info
  serviceId: integer("service_id"),
  projectId: integer("project_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  title: true,
  description: true,
  severity: true,
  serviceId: true,
  projectId: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Custom validation schemas
export const serviceStatusSchema = z.enum(['active', 'stopped', 'error']);
export const activityTypeSchema = z.enum(['deployment', 'alert', 'config', 'team', 'incident']);
export const severitySchema = z.enum(['success', 'warning', 'error', 'info']);
