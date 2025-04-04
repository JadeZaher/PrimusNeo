import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Project, Service, Activity } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { 
  Database, 
  Server, 
  HardDrive, 
  Plus, 
  Edit, 
  Trash, 
  Activity as ActivityIcon, 
  Settings, 
  Globe 
} from "lucide-react";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const projectId = Number(id);
  
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });
  
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: [`/api/projects/${projectId}/services`],
  });
  
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: [`/api/projects/${projectId}/activities`],
  });
  
  // Helper to get service type icon
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="h-5 w-5 text-primary" />;
      case 'compute':
        return <Server className="h-5 w-5 text-primary" />;
      case 'storage':
        return <HardDrive className="h-5 w-5 text-primary" />;
      case 'network':
        return <Globe className="h-5 w-5 text-primary" />;
      default:
        return <Server className="h-5 w-5 text-primary" />;
    }
  };
  
  const isLoading = projectLoading || servicesLoading || activitiesLoading;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!project) {
    return (
      <Layout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Project Not Found</h2>
            <p className="text-neutral-600">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button className="mt-6" asChild>
              <a href="/">Return to Dashboard</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-neutral-900">{project.name}</h1>
              <Badge 
                className={`ml-3 capitalize ${
                  project.status === 'production' ? 'bg-success-light text-success' :
                  project.status === 'staging' ? 'bg-warning-light text-warning' :
                  'bg-warning-light text-warning'
                }`}
                variant="outline"
              >
                {project.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              Created {formatDistanceToNow(new Date(project.createdAt))} ago
              {project.lastDeployed && ` • Last deployed ${formatDistanceToNow(new Date(project.lastDeployed))} ago`}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="services" className="mb-6">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Services</CardTitle>
              </CardHeader>
              <CardContent>
                {!services || services.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-600">No services in this project yet.</p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-primary-light mr-3">
                            {getServiceIcon(service.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-neutral-900">{service.name}</h3>
                            <p className="text-sm text-neutral-600 capitalize">{service.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={service.status === 'active' ? 'bg-success-light text-success' : 'bg-error-light text-error'}
                            variant="outline"
                          >
                            {service.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {!activities || activities.length === 0 ? (
                  <div className="text-center py-12">
                    <ActivityIcon className="h-16 w-16 mx-auto text-neutral-400" />
                    <p className="text-neutral-600 mt-4">No activity found for this project.</p>
                  </div>
                ) : (
                  <ul className="space-y-5">
                    {activities.map((activity, index) => (
                      <li key={activity.id} className={`relative ${index < activities.length - 1 ? 'pb-5' : ''}`}>
                        {index < activities.length - 1 && (
                          <div className="absolute left-0 top-0 ml-0.5 -mt-0.5 h-full w-0.5 bg-neutral-300" aria-hidden="true"></div>
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-white">
                              <ActivityIcon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm font-medium text-neutral-900">
                                {activity.message}
                              </div>
                              <p className="mt-2 text-xs text-neutral-500">
                                {formatDistanceToNow(new Date(activity.timestamp))} ago
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium mb-2">Project Details</h3>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-neutral-600">Project Name</span>
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-neutral-600">Status</span>
                      <Badge className="capitalize">{project.status}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-neutral-600">Monthly Cost</span>
                      <span className="font-medium">${project.costPerMonth.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Project
                    </Button>
                    <Button variant="destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Project
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
