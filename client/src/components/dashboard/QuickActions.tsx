import { Plus, Database, Terminal, ChartPie } from "lucide-react";
import { Server } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      name: "New Compute",
      icon: <Plus className="h-5 w-5 text-primary" />,
      href: "/services/compute/new"
    },
    {
      name: "New Database",
      icon: <Database className="h-5 w-5 text-primary" />,
      href: "/services/database/new"
    },
    {
      name: "Deploy Project",
      icon: <Terminal className="h-5 w-5 text-primary" />,
      href: "/deploy"
    },
    {
      name: "View Insights",
      icon: <ChartPie className="h-5 w-5 text-primary" />,
      href: "/insights"
    }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <a
            key={action.name}
            href={action.href}
            className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <div className="p-3 rounded-full bg-primary-light mb-3">
              {action.icon}
            </div>
            <span className="text-sm font-medium">{action.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
