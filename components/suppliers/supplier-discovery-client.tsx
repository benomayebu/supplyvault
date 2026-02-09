"use client";

import { useState, useEffect, useCallback } from "react";
import { SupplierType, VerificationStatus } from "@prisma/client";
import SupplierCard from "./supplier-card";
import SearchFilters from "./search-filters";

interface Supplier {
  id: string;
  name: string;
  country: string;
  supplier_type: SupplierType | null;
  verification_status: VerificationStatus;
  certificationCount: number;
  capabilities: string[];
  certifications: Array<{
    id: string;
    certification_type: string;
    certification_name: string;
    expiry_date: Date;
    status: string;
  }>;
}

interface SearchResults {
  suppliers: Supplier[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export default function SupplierDiscoveryClient() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    type: "",
    verification: "",
  });
  const [page, setPage] = useState(1);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: "20",
      });

      if (searchQuery) params.append("q", searchQuery);
      if (filters.country) params.append("country", filters.country);
      if (filters.type) params.append("type", filters.type);
      if (filters.verification)
        params.append("verification", filters.verification);

      const response = await fetch(`/api/suppliers/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch suppliers");

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search suppliers by name or country..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-[#3BCEAC] focus:outline-none focus:ring-2 focus:ring-[#3BCEAC]"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters filters={filters} onChange={handleFilterChange} />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading suppliers...</div>
            </div>
          ) : results && results.suppliers.length > 0 ? (
            <>
              {/* Results Count */}
              <div className="mb-4 text-sm text-gray-600">
                Found {results.pagination.total} supplier
                {results.pagination.total !== 1 ? "s" : ""}
              </div>

              {/* Supplier Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {results.suppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))}
              </div>

              {/* Pagination */}
              {results.pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {results.pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(results.pagination.totalPages, p + 1)
                      )
                    }
                    disabled={page === results.pagination.totalPages}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No suppliers found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
