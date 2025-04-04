import { Link } from "wouter";
import { Project } from "@/lib/types";
import { Database, Server, HardDrive, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ProjectSectionProps {
  projects: Project[];
}

export default function ProjectSection({ projects }: ProjectSectionProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-900">Your Projects</h2>
          <Link href="/projects">
            <a className="text-sm font-medium text-primary hover:text-primary-dark">
              View all projects
            </a>
          </Link>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-neutral-600">No projects found. Create your first project!</p>
        </div>
      </div>
    );
  }

  // Helper function to get project service icons
  const getProjectServices = (projectId: number, status: string) => {
    // This is just for UI representation based on the mock data
    switch (projectId) {
      case 1:
        return (
          <>
            <div className="flex items-center text-sm text-neutral-600">
              <Database className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-500" />
              <span>PostgreSQL, Redis</span>
            </div>
            <div className="ml-6 flex items-center text-sm text-neutral-600">
              <Server className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-500" />
              <span>3 services</span>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="flex items-center text-sm text-neutral-600">
              <HardDrive className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-500" />
              <span>Static Storage</span>
            </div>
            <div className="ml-6 flex items-center text-sm text-neutral-600">
              <Globe className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-500" />
              <span>CDN Enabled</span>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="flex items-center text-sm text-neutral-600">
              <Server className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-500" />
              <span>Kubernetes Cluster</span>
            </div>
            <div className="ml-6 flex items-center text-sm text-neutral-600">
              <Database className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-500" />
              <span>TimeSeries DB</span>
            </div>
          </>
        );
      default:
        return (
          <div className="flex items-center text-sm text-neutral-600">
            <Server className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-500" />
            <span>No services</span>
          </div>
        );
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-900">Your Projects</h2>
        <Link href="/projects">
          <a className="text-sm font-medium text-primary hover:text-primary-dark">
            View all projects
          </a>
        </Link>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-neutral-200">
          {projects.map((project) => (
            <li key={project.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-primary truncate">
                        {project.name}
                      </div>
                      <Badge 
                        className={`ml-2 capitalize ${
                          project.status === 'production' ? 'bg-success-light text-success' :
                          project.status === 'staging' ? 'bg-warning-light text-warning' :
                          'bg-warning-light text-warning'
                        }`}
                        variant="outline"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex">
                      {getProjectServices(project.id, project.status)}
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0">
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-neutral-900 font-medium">
                          ${project.costPerMonth.toFixed(2)}/month
                        </div>
                        <div className="text-xs text-neutral-600">
                          {project.lastDeployed ? (
                            `Last deployed ${formatDistanceToNow(new Date(project.lastDeployed))} ago`
                          ) : (
                            "Not yet deployed"
                          )}
                        </div>
                      </div>
                      <Link href={`/projects/${project.id}`}>
                        <a className="ml-2 inline-flex items-center px-3 py-1.5 border border-neutral-300 text-xs font-medium rounded text-neutral-700 bg-white hover:bg-neutral-100 focus:outline-none">
                          Manage
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
