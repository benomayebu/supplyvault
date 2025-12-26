"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { SupplierType } from "@prisma/client";

const supplierTypes: { value: SupplierType; label: string }[] = [
  { value: "FABRIC_MILL", label: "Fabric Mill" },
  { value: "DYE_HOUSE", label: "Dye House" },
  { value: "GARMENT_FACTORY", label: "Garment Factory" },
  { value: "TRIM_SUPPLIER", label: "Trim Supplier" },
  { value: "OTHER", label: "Other" },
];

interface SupplierFiltersProps {
  search: string;
  country: string;
  supplierTypes: SupplierType[];
  countries: string[];
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onSupplierTypesChange: (types: SupplierType[]) => void;
}

export function SupplierFilters({
  search,
  country,
  supplierTypes: selectedTypes,
  countries,
  onSearchChange,
  onCountryChange,
  onSupplierTypesChange,
}: SupplierFiltersProps) {
  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearchChange]);

  const toggleSupplierType = (type: SupplierType) => {
    if (selectedTypes.includes(type)) {
      onSupplierTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onSupplierTypesChange([...selectedTypes, type]);
    }
  };

  const clearFilters = () => {
    setSearchValue("");
    onSearchChange("");
    onCountryChange("");
    onSupplierTypesChange([]);
  };

  const hasActiveFilters = search || country || selectedTypes.length > 0;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-secondary-teal hover:text-secondary-teal/80"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label htmlFor="search" className="sr-only">
          Search suppliers
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="search"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by supplier name..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
          />
        </div>
      </div>

      {/* Country Filter */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700"
        >
          Country
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Supplier Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Supplier Type
        </label>
        <div className="mt-2 space-y-2">
          {supplierTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.value)}
                onChange={() => toggleSupplierType(type.value)}
                className="h-4 w-4 rounded border-gray-300 text-primary-navy focus:ring-secondary-teal"
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
