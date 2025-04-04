import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

import Layout from "@/components/layout/sidebar";
import MetricsOverview from "@/components/dashboard/metrics-overview";
import ServiceHealth from "@/components/dashboard/service-health";
import RecentActivity from "@/components/dashboard/recent-activity";
import ServicesGrid from "@/components/dashboard/services-grid";
import type { Project } from "@shared/schema";
import type { ServiceWithType, DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalServices: 0,
    serviceChange: 0,
    resourceUsage: 0,
    activeDeployments: 0,
    healthStatus: "All healthy",
    costEstimate: "$0",
    costChange: 0,
  });

  // Fetch projects
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Set the first project as selected when projects load
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Fetch services for the selected project
  const { 
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices
  } = useQuery({
    queryKey: ["/api/projects", selectedProject?.id, "services"],
    enabled: !!selectedProject,
  });

  // Update dashboard stats when services change
  useEffect(() => {
    if (services && services.length > 0) {
      // Calculate average resource usage (CPU + Memory)
      const totalCpuUsage = services.reduce((sum, service) => sum + (service.cpu || 0), 0);
      const totalMemoryUsage = services.reduce((sum, service) => sum + (service.memory || 0), 0);
      const avgResourceUsage = Math.round((totalCpuUsage + totalMemoryUsage) / (2 * services.length));
      
      // Count active services
      const activeServices = services.filter(service => service.status === 'active');
      
      setDashboardStats({
        totalServices: services.length,
        serviceChange: 2, // Demo value
        resourceUsage: avgResourceUsage,
        activeDeployments: activeServices.length,
        healthStatus: "All healthy",
        costEstimate: "$187.24", // Demo value
        costChange: 12, // Demo value
      });
    }
  }, [services]);

  const handleServiceConfigure = (serviceId: number) => {
    toast({
      title: "Configure Service",
      description: `Opening configuration for service ID: ${serviceId}`,
    });
  };

  const handleServiceAction = (serviceId: number) => {
    const service = services?.find(s => s.id === serviceId) as ServiceWithType;
    if (service) {
      toast({
        title: `Opening ${service.name}`,
        description: `Opening details for ${service.type.name} service`,
      });
    }
  };

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
  };

  if (projectsError) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading projects</h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {projectsError instanceof Error ? projectsError.message : "An unknown error occurred"}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      projects={projects || []}
      selectedProject={selectedProject}
      onProjectChange={handleProjectChange}
    >
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              All your services and resource monitoring in one place
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link href="/service-provision">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                New Service
              </button>
            </Link>
            <div className="relative">
              <button className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 shadow-sm text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <MetricsOverview stats={dashboardStats} isLoading={servicesLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ServiceHealth projectId={selectedProject?.id} />
        </div>
        <div>
          <RecentActivity projectId={selectedProject?.id} />
        </div>
      </div>

      <ServicesGrid 
        projectId={selectedProject?.id} 
        services={services} 
        isLoading={servicesLoading} 
        onConfigure={handleServiceConfigure}
        onAction={handleServiceAction}
        refetch={refetchServices}
      />
    </Layout>
  );
}
