import Link from "next/link";
import { format } from "date-fns";
import { AlertType } from "@prisma/client";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { clsx } from "clsx";

interface AlertHistoryProps {
  alerts: Array<{
    id: string;
    alert_type: AlertType;
    sent_at: Date | null;
    is_read: boolean;
    created_at: Date;
  }>;
}

const alertTypeLabels: Record<AlertType, string> = {
  NINETY_DAY: "90 Days Before Expiry",
  THIRTY_DAY: "30 Days Before Expiry",
  SEVEN_DAY: "7 Days Before Expiry",
  EXPIRED: "Expired",
};

const alertTypeColors: Record<AlertType, string> = {
  NINETY_DAY: "bg-blue-100 text-blue-800",
  THIRTY_DAY: "bg-yellow-100 text-yellow-800",
  SEVEN_DAY: "bg-orange-100 text-orange-800",
  EXPIRED: "bg-red-100 text-red-800",
};

export function AlertHistory({ alerts }: AlertHistoryProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-primary-navy">
          Alert History
        </h3>
        <p className="text-sm text-gray-500">No alerts have been sent yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-primary-navy">
        Alert History
      </h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Link
            key={alert.id}
            href={`/dashboard/alerts/${alert.id}`}
            className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 hover:border-secondary-teal"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "rounded-full p-2",
                    alert.is_read ? "bg-gray-100" : "bg-secondary-teal/20"
                  )}
                >
                  <Bell
                    className={clsx(
                      "h-5 w-5",
                      alert.is_read ? "text-gray-400" : "text-secondary-teal"
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        alertTypeColors[alert.alert_type]
                      )}
                    >
                      {alertTypeLabels[alert.alert_type]}
                    </span>
                    {!alert.is_read && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-secondary-teal" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {alert.sent_at
                      ? `Sent ${format(new Date(alert.sent_at), "MMM d, yyyy 'at' h:mm a")}`
                      : `Created ${format(new Date(alert.created_at), "MMM d, yyyy")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.is_read ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
