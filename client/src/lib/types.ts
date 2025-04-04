// Types for the frontend components that extend the DB schema types

// Import from schema
import {
  User,
  Project,
  Service,
  ServiceType,
  Activity
} from "@shared/schema";

// Enhanced types with additional UI related properties
export interface ServiceWithType extends Service {
  type: ServiceType;
}

export interface ActivityWithService extends Activity {
  service?: {
    id: number;
    name: string;
  };
}

// UI types
export interface MetricProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  progressValue?: number;
}

export interface ServiceCardProps {
  service: ServiceWithType;
  onConfigure: (serviceId: number) => void;
  onAction: (serviceId: number) => void;
}

export type ServiceStatus = 'active' | 'stopped' | 'error';

export type ActivityType = 'deployment' | 'alert' | 'config' | 'team' | 'incident';

export type Severity = 'success' | 'warning' | 'error' | 'info';

export interface StatusBadgeProps {
  status: ServiceStatus;
}

export interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectChange: (project: Project) => void;
}

export interface ServiceMetric {
  name: string;
  value: string;
  percentage: number;
}

export interface ServiceHealthEntry {
  name: string;
  uptime: number;
  status: 'success' | 'warning' | 'error';
}

export interface DashboardStats {
  totalServices: number;
  serviceChange: number;
  resourceUsage: number;
  activeDeployments: number;
  healthStatus: string;
  costEstimate: string;
  costChange: number;
}
