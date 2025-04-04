import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  avatar: text("avatar"),
  role: text("role").default("user").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  avatar: true,
  role: true,
});

// Project schema
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  status: text("status").notNull().default("development"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  lastDeployed: text("last_deployed"),
  costPerMonth: real("cost_per_month").default(0),
  userId: integer("user_id").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  status: true,
  costPerMonth: true,
  userId: true,
});

// Service schema
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // "compute", "database", "storage", "function", "network", "web3", "spatial", "3d_amp"
  status: text("status").notNull().default("active"),
  projectId: integer("project_id").notNull(),
  config: text("config").notNull().$defaultFn(() => JSON.stringify({})),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  type: true,
  status: true,
  projectId: true,
  config: true,
});

// Resource usage schema
export const resourceUsage = sqliteTable("resource_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").notNull(),
  cpuUsage: real("cpu_usage").default(0),
  memoryUsage: real("memory_usage").default(0),
  storageUsage: real("storage_usage").default(0),
  networkUsage: real("network_usage").default(0),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertResourceUsageSchema = createInsertSchema(resourceUsage).pick({
  serviceId: true,
  cpuUsage: true,
  memoryUsage: true,
  storageUsage: true,
  networkUsage: true,
});

// Activity log schema
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id"),
  projectId: integer("project_id"),
  serviceId: integer("service_id"),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  message: true,
  userId: true,
  projectId: true,
  serviceId: true,
});

// Service health schema
export const serviceHealth = sqliteTable("service_health", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceType: text("service_type").notNull().unique(),
  status: text("status").notNull().default("operational"),
  uptime: real("uptime").default(100),
  lastUpdated: text("last_updated").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertServiceHealthSchema = createInsertSchema(serviceHealth).pick({
  serviceType: true,
  status: true,
  uptime: true,
});

// Helper function for SQLite date mapping
export function formatDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  return new Date(dateString);
}

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type ResourceUsage = typeof resourceUsage.$inferSelect;
export type InsertResourceUsage = z.infer<typeof insertResourceUsageSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ServiceHealthStatus = typeof serviceHealth.$inferSelect;
export type InsertServiceHealthStatus = z.infer<typeof insertServiceHealthSchema>;