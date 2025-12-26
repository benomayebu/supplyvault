import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { CertificationType } from "@prisma/client";
import { FileCheck, Building2, Calendar, Clock } from "lucide-react";
import { clsx } from "clsx";

interface CertificationHeaderProps {
  certification: {
    id: string;
    certification_name: string;
    certification_type: CertificationType;
    issuing_body: string;
    issue_date: Date;
    expiry_date: Date;
    status: "VALID" | "EXPIRING_SOON" | "EXPIRED";
    supplier: {
      id: string;
      name: string;
    };
  };
}

const certificationTypeLabels: Record<CertificationType, string> = {
  GOTS: "GOTS",
  OEKO_TEX: "OEKO-TEX",
  SA8000: "SA8000",
  BSCI: "BSCI",
  FAIR_WEAR: "Fair Wear",
  ISO14001: "ISO 14001",
  OTHER: "Other",
};

const formatCertificationType = (type: CertificationType): string => {
  return certificationTypeLabels[type] || type;
};

export function CertificationHeader({
  certification,
}: CertificationHeaderProps) {
  const daysUntilExpiry = differenceInDays(
    new Date(certification.expiry_date),
    new Date()
  );

  const getStatusColor = () => {
    if (certification.status === "EXPIRED" || daysUntilExpiry < 0) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (daysUntilExpiry <= 30) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (daysUntilExpiry <= 60) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusLabel = () => {
    if (certification.status === "EXPIRED" || daysUntilExpiry < 0) {
      return "Expired";
    }
    if (daysUntilExpiry <= 30) {
      return "Expiring Soon";
    }
    if (daysUntilExpiry <= 60) {
      return "Expiring Soon";
    }
    return "Valid";
  };

  const statusColor = getStatusColor();
  const statusLabel = getStatusLabel();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary-navy">
            {certification.certification_name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={clsx(
                "inline-flex rounded-full border px-3 py-1 text-sm font-semibold",
                statusColor
              )}
            >
              {statusLabel}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <FileCheck className="h-4 w-4" />
              {formatCertificationType(certification.certification_type)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">Supplier</span>
          </div>
          <Link
            href={`/dashboard/suppliers/${certification.supplier.id}`}
            className="mt-1 block text-sm font-semibold text-primary-navy hover:text-secondary-teal"
          >
            {certification.supplier.name}
          </Link>
        </div>

        {certification.issuing_body && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Issuing Body</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {certification.issuing_body}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Issue Date</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {format(new Date(certification.issue_date), "MMM d, yyyy")}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Expiry Date</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {format(new Date(certification.expiry_date), "MMM d, yyyy")}
          </p>
          {daysUntilExpiry >= 0 && (
            <p
              className={clsx(
                "mt-1 text-xs font-medium",
                daysUntilExpiry <= 30
                  ? "text-red-600"
                  : daysUntilExpiry <= 60
                    ? "text-yellow-600"
                    : "text-green-600"
              )}
            >
              {daysUntilExpiry === 0
                ? "Expires today"
                : `${daysUntilExpiry} days remaining`}
            </p>
          )}
          {daysUntilExpiry < 0 && (
            <p className="mt-1 text-xs font-medium text-red-600">
              Expired {Math.abs(daysUntilExpiry)} days ago
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
