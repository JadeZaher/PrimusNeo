import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OverviewSection from "./OverviewSection";
import ProjectSection from "./ProjectSection";
import ServiceStatusMonitoring from "./ServiceStatusMonitoring";
import QuickActions from "./QuickActions";
import ActivityFeed from "./ActivityFeed";
import { DashboardOverview } from "@/lib/types";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("Last 24 hours");
  
  const { data: overview, isLoading, error } = useQuery<DashboardOverview>({
    queryKey: ["/api/overview"],
  });

  if (error) {
    return (
      <div className="py-8 px-4 text-center">
        <h2 className="text-xl font-semibold text-red-500">Error loading dashboard data</h2>
        <p className="mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600">Monitor and manage your cloud resources</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Resource
          </Button>
          
          <Button variant="outline" className="flex items-center">
            <span>{timeRange}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard content */}
      {isLoading ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      ) : (
        <>
          <OverviewSection resources={overview?.resources} />
          
          <ProjectSection projects={overview?.projects || []} />
          
          <ServiceStatusMonitoring 
            serviceHealth={overview?.serviceHealth || []} 
            resourceUsage={overview?.usage || {
              cpu: 0,
              memory: 0,
              storage: 0,
              network: 0,
              database: 0
            }} 
          />
          
          <QuickActions />
          
          <ActivityFeed activities={overview?.recentActivities || []} />
        </>
      )}
    </div>
  );
}
