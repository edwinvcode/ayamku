import { DashboardAlert } from "@/types/database";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertPanelProps {
  alerts: DashboardAlert[];
}

const severityConfig = {
  urgent: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-700/50 dark:text-red-300",
    iconClassName: "text-red-500 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-700/50 dark:text-yellow-300",
    iconClassName: "text-yellow-500 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-700/50 dark:text-blue-300",
    iconClassName: "text-blue-500 dark:text-blue-400",
  },
};

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        ✅ Tidak ada peringatan saat ini
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;
        return (
          <div
            key={index}
            className={cn("flex items-start gap-2 px-3 py-2 rounded-lg border text-sm", config.className)}
          >
            <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconClassName)} />
            <span>{alert.message}</span>
          </div>
        );
      })}
    </div>
  );
}
