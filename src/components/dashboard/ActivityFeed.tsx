import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: "check-in" | "check-out" | "leave" | "attendance";
  title: string;
  timestamp: string;
  status?: "success" | "error" | "warning";
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const icons = {
  "check-in": CheckCircle,
  "check-out": XCircle,
  leave: AlertCircle,
  attendance: Clock,
};

const statusColors = {
  success: "text-emerald-600",
  error: "text-red-600",
  warning: "text-amber-600",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => {
            const Icon = icons[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Icon
                    className={`h-4 w-4 ${
                      activity.status
                        ? statusColors[activity.status]
                        : "text-slate-400"
                    }`}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
