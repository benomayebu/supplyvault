"use client";

import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";
import { SupplierType } from "@prisma/client";
import { SupplierWithCertCount } from "@/lib/suppliers";
import { clsx } from "clsx";
import {
  VerificationBadge,
  VerificationStatus,
} from "./verification-badge";

interface SupplierRowProps {
  supplier: SupplierWithCertCount;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
}

const supplierTypeLabels: Record<SupplierType, string> = {
  FABRIC_MILL: "Fabric Mill",
  DYE_HOUSE: "Dye House",
  GARMENT_FACTORY: "Garment Factory",
  TRIM_SUPPLIER: "Trim Supplier",
  OTHER: "Other",
};

const supplierTypeColors: Record<SupplierType, string> = {
  FABRIC_MILL: "bg-blue-100 text-blue-800",
  DYE_HOUSE: "bg-purple-100 text-purple-800",
  GARMENT_FACTORY: "bg-green-100 text-green-800",
  TRIM_SUPPLIER: "bg-yellow-100 text-yellow-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const statusColors = {
  valid: "bg-green-100 text-green-800",
  expiring: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800",
};

const statusLabels = {
  valid: "Valid",
  expiring: "Expiring",
  expired: "Expired",
};

export function SupplierRow({
  supplier,
  isSelected,
  onSelect,
  onDelete,
}: SupplierRowProps) {
  const getCountryFlag = (country: string): string => {
    // Simple emoji mapping for common countries
    const flags: Record<string, string> = {
      "United States": "🇺🇸",
      "United Kingdom": "🇬🇧",
      China: "🇨🇳",
      India: "🇮🇳",
      Bangladesh: "🇧🇩",
      Vietnam: "🇻🇳",
      Turkey: "🇹🇷",
      Italy: "🇮🇹",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Spain: "🇪🇸",
      Portugal: "🇵🇹",
      Mexico: "🇲🇽",
      Brazil: "🇧🇷",
      Canada: "🇨🇦",
      Japan: "🇯🇵",
      "South Korea": "🇰🇷",
      Thailand: "🇹🇭",
      Indonesia: "🇮🇩",
      Pakistan: "🇵🇰",
    };
    return flags[country] || "🌍";
  };

  return (
    <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50">
      <td className="whitespace-nowrap px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(supplier.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-navy focus:ring-secondary-teal"
          aria-label={`Select ${supplier.name}`}
        />
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/suppliers/${supplier.id}`}
            className="font-medium text-primary-navy hover:text-secondary-teal"
          >
            {supplier.name}
          </Link>
          {supplier.verification_status && (
            <VerificationBadge
              status={supplier.verification_status as VerificationStatus}
              size="sm"
              showLabel={false}
            />
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
        <span className="mr-2">{getCountryFlag(supplier.country)}</span>
        {supplier.country}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={clsx(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
            supplierTypeColors[supplier.supplier_type]
          )}
        >
          {supplierTypeLabels[supplier.supplier_type]}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
        <Link
          href={`/dashboard/certifications?supplier=${supplier.id}`}
          className="font-medium text-primary-navy hover:text-secondary-teal"
        >
          {supplier.certCount}
        </Link>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={clsx(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
            statusColors[supplier.status]
          )}
        >
          {statusLabels[supplier.status]}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/suppliers/${supplier.id}`}
            className="text-primary-navy hover:text-secondary-teal"
            aria-label={`View ${supplier.name}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/dashboard/suppliers/${supplier.id}/edit`}
            className="text-primary-navy hover:text-secondary-teal"
            aria-label={`Edit ${supplier.name}`}
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(supplier.id)}
            className="text-red-600 hover:text-red-700"
            aria-label={`Delete ${supplier.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
