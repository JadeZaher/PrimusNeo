import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription  
} from "@/components/ui/card";
import { Activity } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, Database, CreditCard } from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            <CardDescription>Events from your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-600 py-10">
              No recent activities to display.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper to get the appropriate icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return (
          <div className="h-8 w-8 rounded-full bg-error flex items-center justify-center ring-8 ring-white">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
        );
      case 'deployment':
        return (
          <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center ring-8 ring-white">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        );
      case 'database':
        return (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-white">
            <Database className="h-5 w-5 text-white" />
          </div>
        );
      case 'billing':
        return (
          <div className="h-8 w-8 rounded-full bg-warning flex items-center justify-center ring-8 ring-white">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-neutral-400 flex items-center justify-center ring-8 ring-white">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        );
    }
  };

  // Helper to get the activity title
  const getActivityTitle = (activity: Activity) => {
    const parts = activity.message.split(':');
    return parts.length > 1 ? parts[0] : activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
  };

  // Helper to get the activity description
  const getActivityDescription = (activity: Activity) => {
    const parts = activity.message.split(':');
    return parts.length > 1 ? parts[1].trim() : activity.message;
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          <CardDescription>Events from your account</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-5">
            {activities.map((activity, index) => (
              <li key={activity.id} className={`relative ${index < activities.length - 1 ? 'pb-5' : ''}`}>
                {index < activities.length - 1 && (
                  <div className="absolute left-0 top-0 ml-0.5 -mt-0.5 h-full w-0.5 bg-neutral-300" aria-hidden="true"></div>
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <a href="#" className="font-medium text-neutral-900">
                          {getActivityTitle(activity)}
                        </a>
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-600">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="mt-2 text-xs text-neutral-500">
                        {formatDistanceToNow(new Date(activity.timestamp))} ago
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 text-center">
            <a href="/activity" className="text-sm font-medium text-primary hover:text-primary-dark">
              View all activity
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
