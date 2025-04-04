import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
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
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("development"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastDeployed: timestamp("last_deployed"),
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
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Updated to include "web3", "spatial", "3d_amp"
  status: text("status").notNull().default("active"),
  projectId: integer("project_id").notNull(),
  config: json("config").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  type: true,
  status: true,
  projectId: true,
  config: true,
});

// Resource usage schema
export const resourceUsage = pgTable("resource_usage", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  cpuUsage: real("cpu_usage").default(0),
  memoryUsage: real("memory_usage").default(0),
  storageUsage: real("storage_usage").default(0),
  networkUsage: real("network_usage").default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertResourceUsageSchema = createInsertSchema(resourceUsage).pick({
  serviceId: true,
  cpuUsage: true,
  memoryUsage: true,
  storageUsage: true,
  networkUsage: true,
});

// Activity log schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id"),
  projectId: integer("project_id"),
  serviceId: integer("service_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  message: true,
  userId: true,
  projectId: true,
  serviceId: true,
});

// Service health schema
export const serviceHealth = pgTable("service_health", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull().unique(),
  status: text("status").notNull().default("operational"),
  uptime: real("uptime").default(100),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertServiceHealthSchema = createInsertSchema(serviceHealth).pick({
  serviceType: true,
  status: true,
  uptime: true,
});

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
