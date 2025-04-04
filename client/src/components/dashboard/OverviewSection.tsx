import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Server, Database, HardDrive, Rocket, ArrowUp } from "lucide-react";

interface ResourceOverviewProps {
  resources?: {
    compute: number;
    databases: number;
    storage: number;
    deployments: {
      total: number;
      healthy: number;
    };
  };
}

export default function OverviewSection({ resources }: ResourceOverviewProps) {
  if (!resources) {
    return null;
  }
  
  const { compute, databases, storage, deployments } = resources;
  
  const cards = [
    {
      title: "Active Compute",
      value: compute,
      icon: <Server className="text-primary text-xl" />,
      change: "+2",
      changeType: "success",
      linkText: "View all",
      linkHref: "/services/compute"
    },
    {
      title: "Database Services",
      value: databases,
      icon: <Database className="text-primary text-xl" />,
      change: "+1",
      changeType: "success",
      linkText: "View all",
      linkHref: "/services/database"
    },
    {
      title: "Storage Used",
      value: "254 GB",
      icon: <HardDrive className="text-primary text-xl" />,
      change: "12%",
      changeType: "warning",
      linkText: "View details",
      linkHref: "/services/storage"
    },
    {
      title: "Deployments",
      value: `${deployments.healthy}/${deployments.total}`,
      icon: <Rocket className="text-success text-xl" />,
      status: "Healthy",
      statusType: "success",
      linkText: "View logs",
      linkHref: "/deployments"
    }
  ];
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-neutral-900 mb-4">Resource Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                  {card.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-600 truncate">{card.title}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-neutral-900">{card.value}</div>
                      {card.change && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          card.changeType === "success" ? "text-success" : "text-warning"
                        }`}>
                          <ArrowUp className="mr-0.5 h-4 w-4" />
                          <span>{card.change}</span>
                        </div>
                      )}
                      {card.status && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          card.statusType === "success" ? "text-success" : "text-warning"
                        }`}>
                          <span>{card.status}</span>
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-neutral-100 px-4 py-3">
              <div className="text-sm">
                <a href={card.linkHref} className="font-medium text-primary hover:text-primary-dark">
                  {card.linkText}
                </a>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
