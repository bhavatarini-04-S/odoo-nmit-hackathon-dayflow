import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {trend && (
              <p
                className={`text-xs ${
                  trend.isPositive
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% from last week
              </p>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
            <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
