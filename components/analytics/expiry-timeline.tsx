"use client";

import { formatDistanceToNow } from "date-fns";
import { Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Certification {
  id: string;
  certification_name: string;
  certification_type: string;
  expiry_date: Date;
  supplier?: {
    name: string;
  };
}

interface ExpiryTimelineProps {
  certifications: Certification[];
  viewType: "supplier" | "brand";
}

export function ExpiryTimeline({
  certifications,
  viewType,
}: ExpiryTimelineProps) {
  const now = new Date();

  // Filter and sort certifications by expiry date
  const upcomingExpiries = certifications
    .filter((cert) => new Date(cert.expiry_date) > now)
    .sort(
      (a, b) =>
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    )
    .slice(0, 10); // Show top 10 upcoming expiries

  // Calculate days until expiry and urgency level
  const getUrgencyLevel = (expiryDate: Date) => {
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 7) return "critical";
    if (daysUntilExpiry <= 30) return "warning";
    if (daysUntilExpiry <= 90) return "safe";
    return "future";
  };

  const urgencyColors = {
    critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      badge: "bg-red-100 text-red-800",
      icon: "text-red-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      badge: "bg-yellow-100 text-yellow-800",
      icon: "text-yellow-600",
    },
    safe: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      badge: "bg-green-100 text-green-800",
      icon: "text-green-600",
    },
    future: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-800",
      badge: "bg-gray-100 text-gray-800",
      icon: "text-gray-600",
    },
  };

  if (upcomingExpiries.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No upcoming expiries
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {certifications.length === 0
            ? "Upload certifications to track their expiry dates"
            : "All certifications are valid for more than 90 days"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingExpiries.map((cert) => {
        const expiryDate = new Date(cert.expiry_date);
        const urgency = getUrgencyLevel(expiryDate);
        const colors = urgencyColors[urgency];
        const href =
          viewType === "supplier"
            ? `/supplier/certifications/${cert.id}`
            : `/brand/certifications/${cert.id}`;

        return (
          <Link
            key={cert.id}
            href={href}
            className={`block rounded-lg border ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`mt-0.5 rounded-full p-2 ${colors.badge}`}>
                  <AlertCircle className={`h-4 w-4 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${colors.text} truncate`}>
                    {cert.certification_name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {cert.certification_type}
                  </p>
                  {viewType === "brand" && cert.supplier && (
                    <p className="text-xs text-gray-500 mt-1">
                      Supplier: {cert.supplier.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-medium ${colors.text}`}>
                  {formatDistanceToNow(expiryDate, { addSuffix: true })}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {expiryDate.toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
