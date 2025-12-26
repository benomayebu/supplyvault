"use client";

import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { AlertType } from "@prisma/client";
import { Bell, Clock, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface AlertCardProps {
  alert: {
    id: string;
    alert_type: AlertType;
    sent_at: Date | null;
    is_read: boolean;
    created_at: Date;
    certification: {
      id: string;
      certification_name: string;
      certification_type: string;
      expiry_date: Date;
      supplier: {
        id: string;
        name: string;
      };
    };
  };
  onMarkAsRead?: (alertId: string) => void;
}

const alertTypeLabels: Record<AlertType, string> = {
  NINETY_DAY: "90 Days",
  THIRTY_DAY: "30 Days",
  SEVEN_DAY: "7 Days",
  EXPIRED: "Expired",
};

const alertTypeColors: Record<AlertType, string> = {
  NINETY_DAY: "bg-blue-100 text-blue-800 border-blue-200",
  THIRTY_DAY: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SEVEN_DAY: "bg-red-100 text-red-800 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
};

export function AlertCard({ alert, onMarkAsRead }: AlertCardProps) {
  const daysUntilExpiry = differenceInDays(
    new Date(alert.certification.expiry_date),
    new Date()
  );

  const handleClick = () => {
    if (!alert.is_read && onMarkAsRead) {
      onMarkAsRead(alert.id);
    }
  };

  const urgencyColor =
    daysUntilExpiry < 0
      ? "text-gray-600"
      : daysUntilExpiry <= 7
        ? "text-red-600"
        : daysUntilExpiry <= 30
          ? "text-yellow-600"
          : "text-blue-600";

  return (
    <Link
      href={`/dashboard/certifications/${alert.certification.id}`}
      onClick={handleClick}
      className={clsx(
        "block rounded-lg border p-4 transition-all hover:shadow-md",
        alert.is_read
          ? "border-gray-200 bg-white"
          : "border-secondary-teal bg-secondary-teal/5"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                alertTypeColors[alert.alert_type]
              )}
            >
              {alertTypeLabels[alert.alert_type]} Alert
            </span>
            {!alert.is_read && (
              <span className="inline-flex h-2 w-2 rounded-full bg-secondary-teal" />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              {alert.certification.certification_name}
            </h3>
            <p className="text-sm text-gray-600">
              {alert.certification.supplier.name}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className={clsx("font-medium", urgencyColor)}>
              {daysUntilExpiry < 0
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                : daysUntilExpiry === 0
                  ? "Expires today"
                  : `${daysUntilExpiry} days until expiry`}
            </span>
            {alert.sent_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(alert.sent_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center">
          {alert.is_read ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Bell className="h-5 w-5 text-secondary-teal" />
          )}
        </div>
      </div>
    </Link>
  );
}
