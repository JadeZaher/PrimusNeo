import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceHealth } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Plus, Settings, Activity, ChartBarStacked } from "lucide-react";

export default function ServicePage() {
  const { type } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: serviceHealth, isLoading } = useQuery<ServiceHealth[]>({ 
    queryKey: ["/api/service-health"] 
  });
  
  const typeDisplay = type?.charAt(0).toUpperCase() + type?.slice(1);
  
  // Find health status for this service type
  const healthStatus = serviceHealth?.find(status => 
    status.serviceType.toLowerCase().includes(type || "")
  );
  
  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{typeDisplay} Services</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage your {type} resources and configuration
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create {typeDisplay} Service
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        healthStatus?.status === 'operational' ? 'bg-success' : 
                        healthStatus?.status === 'degraded' ? 'bg-warning' : 'bg-error'
                      }`}
                    />
                    <span className="ml-3 text-sm font-medium text-neutral-900">
                      {healthStatus?.serviceType || `${typeDisplay} Services`}
                    </span>
                  </div>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      healthStatus?.status === 'operational' ? 'bg-success-light text-success' : 
                      healthStatus?.status === 'degraded' ? 'bg-warning-light text-warning' : 'bg-error-light text-error'
                    }`}
                  >
                    {healthStatus?.status === 'operational' ? '100% Uptime' : 
                     healthStatus?.status === 'degraded' ? 'Degraded' : 'Outage'}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instances">Instances</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-neutral-600">
                        {activeTab === "overview" && "Create and manage your services here"}
                      </p>
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create {typeDisplay} Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instances" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Instances</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <p className="text-neutral-600">No instances found</p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service Instance
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="metrics" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <ChartBarStacked className="h-16 w-16 mx-auto text-neutral-400" />
                    <p className="text-neutral-600 mt-4">No metrics data available</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <Settings className="h-16 w-16 mx-auto text-neutral-400" />
                    <p className="text-neutral-600 mt-4">Configure service settings here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
