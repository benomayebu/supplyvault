"use client";

interface SearchFiltersProps {
  filters: {
    country: string;
    type: string;
    verification: string;
  };
  onChange: (filters: any) => void;
}

const SUPPLIER_TYPES = [
  { value: "FABRIC_MILL", label: "Fabric Mill" },
  { value: "DYE_HOUSE", label: "Dye House" },
  { value: "GARMENT_FACTORY", label: "Garment Factory" },
  { value: "TRIM_SUPPLIER", label: "Trim Supplier" },
  { value: "OTHER", label: "Other" },
];

const VERIFICATION_STATUSES = [
  { value: "VERIFIED", label: "Verified" },
  { value: "BASIC", label: "Basic" },
  { value: "UNVERIFIED", label: "Unverified" },
];

const COMMON_COUNTRIES = [
  "Bangladesh",
  "China",
  "India",
  "Vietnam",
  "Turkey",
  "Pakistan",
  "Indonesia",
  "Thailand",
  "Cambodia",
  "Sri Lanka",
];

export default function SearchFilters({
  filters,
  onChange,
}: SearchFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onChange({
      country: "",
      type: "",
      verification: "",
    });
  };

  const hasActiveFilters =
    filters.country || filters.type || filters.verification;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#3BCEAC] hover:text-[#3BCEAC]/80"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Country Filter */}
        <div>
          <label
            htmlFor="country"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <select
            id="country"
            value={filters.country}
            onChange={(e) => handleFilterChange("country", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
          >
            <option value="">All Countries</option>
            {COMMON_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier Type Filter */}
        <div>
          <label
            htmlFor="type"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Supplier Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
          >
            <option value="">All Types</option>
            {SUPPLIER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status Filter */}
        <div>
          <label
            htmlFor="verification"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Verification Status
          </label>
          <select
            id="verification"
            value={filters.verification}
            onChange={(e) => handleFilterChange("verification", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
          >
            <option value="">All Statuses</option>
            {VERIFICATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
