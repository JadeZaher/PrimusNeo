import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ServiceHealth } from "@/lib/types";

interface ServiceStatusMonitoringProps {
  serviceHealth: ServiceHealth[];
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
    database: number;
  };
}

export default function ServiceStatusMonitoring({ serviceHealth, resourceUsage }: ServiceStatusMonitoringProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
      {/* Service Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Service Health</CardTitle>
          <p className="text-sm text-neutral-600">Current status of your cloud services</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceHealth.map((service) => (
              <div key={service.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      service.status === 'operational' ? 'bg-success' : 
                      service.status === 'degraded' ? 'bg-warning' : 'bg-error'
                    }`}
                  />
                  <span className="ml-3 text-sm font-medium text-neutral-900">{service.serviceType}</span>
                </div>
                <span 
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    service.status === 'operational' ? 'bg-success-light text-success' : 
                    service.status === 'degraded' ? 'bg-warning-light text-warning' : 'bg-error-light text-error'
                  }`}
                >
                  {service.status === 'operational' ? '100% Uptime' : 
                   service.status === 'degraded' ? 'Degraded' : 'Outage'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center">
            <a href="/service-health" className="text-sm font-medium text-primary hover:text-primary-dark">
              View detailed status
            </a>
          </div>
        </CardContent>
      </Card>
      
      {/* Resource Usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Resource Usage</CardTitle>
          <p className="text-sm text-neutral-600">Current consumption across services</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* CPU Usage */}
            <ResourceUsageBar 
              label="CPU Usage" 
              percentage={resourceUsage.cpu} 
              isWarning={resourceUsage.cpu > 80}
            />
            
            {/* Memory Usage */}
            <ResourceUsageBar 
              label="Memory Usage" 
              percentage={resourceUsage.memory} 
              isWarning={resourceUsage.memory > 80}
            />
            
            {/* Storage Usage */}
            <ResourceUsageBar 
              label="Storage Usage" 
              percentage={resourceUsage.storage} 
              isWarning={resourceUsage.storage > 80}
            />
            
            {/* Network Throughput */}
            <ResourceUsageBar 
              label="Network Throughput" 
              percentage={resourceUsage.network} 
              isWarning={resourceUsage.network > 80}
            />
            
            {/* Database Connections */}
            <ResourceUsageBar 
              label="Database Connections" 
              percentage={resourceUsage.database} 
              isWarning={resourceUsage.database > 80}
            />
          </div>
          <div className="mt-5 text-center">
            <a href="/metrics" className="text-sm font-medium text-primary hover:text-primary-dark">
              View detailed metrics
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ResourceUsageBarProps {
  label: string;
  percentage: number;
  isWarning?: boolean;
}

function ResourceUsageBar({ label, percentage, isWarning = false }: ResourceUsageBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-neutral-900">{label}</div>
        <div className="text-sm font-medium text-neutral-700">{percentage}%</div>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
        <div 
          className={`h-full ${isWarning ? 'bg-warning' : 'bg-primary'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
