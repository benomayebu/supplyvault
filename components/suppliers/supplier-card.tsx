"use client";

import Link from "next/link";
import { SupplierType, VerificationStatus } from "@prisma/client";

interface SupplierCardProps {
  supplier: {
    id: string;
    name: string;
    country: string;
    supplier_type: SupplierType | null;
    verification_status: VerificationStatus;
    certificationCount: number;
    capabilities: string[];
  };
}

const VERIFICATION_BADGES = {
  VERIFIED: {
    label: "Verified",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: "✓",
  },
  BASIC: {
    label: "Basic",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "◐",
  },
  UNVERIFIED: {
    label: "Unverified",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "○",
  },
};

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  FABRIC_MILL: "Fabric Mill",
  DYE_HOUSE: "Dye House",
  GARMENT_FACTORY: "Garment Factory",
  TRIM_SUPPLIER: "Trim Supplier",
  OTHER: "Other",
};

export default function SupplierCard({ supplier }: SupplierCardProps) {
  const badge = VERIFICATION_BADGES[supplier.verification_status];

  return (
    <Link
      href={`/brand/suppliers/${supplier.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#3BCEAC] hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {supplier.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            📍 {supplier.country}
            {supplier.supplier_type &&
              ` • ${SUPPLIER_TYPE_LABELS[supplier.supplier_type]}`}
          </p>
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
        >
          {badge.icon} {badge.label}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>
            {supplier.certificationCount} certification
            {supplier.certificationCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Capabilities */}
      {supplier.capabilities && supplier.capabilities.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {supplier.capabilities.slice(0, 3).map((capability, index) => (
              <span
                key={index}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                {capability}
              </span>
            ))}
            {supplier.capabilities.length > 3 && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                +{supplier.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* View Details Link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm font-medium text-[#3BCEAC]">
          View Details →
        </span>
      </div>
    </Link>
  );
}
