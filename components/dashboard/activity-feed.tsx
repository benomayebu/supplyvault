import Link from "next/link";
import { FileCheck, Calendar } from "lucide-react";
import { format } from "date-fns";
import { CertificationType } from "@prisma/client";

interface ActivityItem {
  id: string;
  supplier: {
    id: string;
    name: string;
  };
  certification_type: CertificationType;
  certification_name: string;
  created_at: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const formatCertificationType = (type: CertificationType): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-primary-navy">
          Recent Activity
        </h3>
        <p className="text-sm text-gray-500">
          No recent certifications uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-primary-navy">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={`/dashboard/certifications/${activity.id}`}
            className="block rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 hover:border-secondary-teal"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-secondary-teal" />
                  <span className="font-medium text-gray-900">
                    {activity.supplier.name}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {activity.certification_name} (
                  {formatCertificationType(activity.certification_type)})
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(
                      new Date(activity.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
