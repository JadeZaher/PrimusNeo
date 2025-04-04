// Project types
export interface Project {
  id: number;
  name: string;
  status: "development" | "production" | "staging";
  createdAt: string;
  lastDeployed: string | null;
  costPerMonth: number;
  userId: number;
}

// Service types
export interface Service {
  id: number;
  name: string;
  type: "compute" | "database" | "storage" | "function" | "network";
  status: "active" | "inactive" | "error";
  projectId: number;
  config: Record<string, any>;
  createdAt: string;
}

// Resource usage type
export interface ResourceUsage {
  id: number;
  serviceId: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkUsage: number;
  timestamp: string;
}

// Activity type
export interface Activity {
  id: number;
  type: "alert" | "deployment" | "database" | "billing" | "project_created" | "service_created";
  message: string;
  userId: number | null;
  projectId: number | null;
  serviceId: number | null;
  timestamp: string;
}

// Service health type
export interface ServiceHealth {
  id: number;
  serviceType: string;
  status: "operational" | "degraded" | "outage";
  uptime: number;
  lastUpdated: string;
}

// Dashboard overview type
export interface DashboardOverview {
  resources: {
    compute: number;
    databases: number;
    storage: number;
    deployments: {
      total: number;
      healthy: number;
    };
  };
  usage: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
    database: number;
  };
  serviceHealth: ServiceHealth[];
  recentActivities: Activity[];
  projects: Project[];
}

// User type
export interface User {
  id: number;
  username: string;
  fullName: string;
  avatar?: string;
  role: string;
}
