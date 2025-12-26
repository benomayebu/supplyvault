"use client";

import { useState, useEffect } from "react";
import { AlertType } from "@prisma/client";
import { Search, Filter } from "lucide-react";

interface AlertFiltersProps {
  showUnreadOnly: boolean;
  onShowUnreadOnlyChange: (value: boolean) => void;
  alertType: AlertType | "ALL";
  onAlertTypeChange: (value: AlertType | "ALL") => void;
  supplierSearch: string;
  onSupplierSearchChange: (value: string) => void;
  sortOrder: "newest" | "oldest";
  onSortOrderChange: (value: "newest" | "oldest") => void;
}

const alertTypes: { value: AlertType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "NINETY_DAY", label: "90 Days" },
  { value: "THIRTY_DAY", label: "30 Days" },
  { value: "SEVEN_DAY", label: "7 Days" },
  { value: "EXPIRED", label: "Expired" },
];

export function AlertFilters({
  showUnreadOnly,
  onShowUnreadOnlyChange,
  alertType,
  onAlertTypeChange,
  supplierSearch,
  onSupplierSearchChange,
  sortOrder,
  onSortOrderChange,
}: AlertFiltersProps) {
  const [searchValue, setSearchValue] = useState(supplierSearch);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSupplierSearchChange(searchValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, onSupplierSearchChange]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Unread Only Toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => onShowUnreadOnlyChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-secondary-teal focus:ring-secondary-teal"
          />
          <span className="text-sm font-medium text-gray-700">
            Show unread only
          </span>
        </label>

        {/* Alert Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={alertType}
            onChange={(e) =>
              onAlertTypeChange(e.target.value as AlertType | "ALL")
            }
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
          >
            {alertTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) =>
            onSortOrderChange(e.target.value as "newest" | "oldest")
          }
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        {/* Supplier Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by supplier..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-1.5 pl-10 pr-3 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
          />
        </div>
      </div>
    </div>
  );
}
