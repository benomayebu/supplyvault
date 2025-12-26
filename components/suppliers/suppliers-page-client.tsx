"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { SupplierTable } from "./supplier-table";
import { SupplierFilters } from "./supplier-filters";
import { SupplierWithCertCount } from "@/lib/suppliers";
import { SupplierType } from "@prisma/client";
import { EmptySuppliers } from "@/components/ui/empty-state";

// Lazy load modal component
const AddSupplierModal = dynamic(
  () =>
    import("./add-supplier-modal").then((mod) => ({
      default: mod.AddSupplierModal,
    })),
  {
    loading: () => null,
    ssr: false,
  }
);

interface SuppliersPageClientProps {
  initialSuppliers: SupplierWithCertCount[];
  countries: string[];
  initialSearch: string;
  initialCountry: string;
  initialSupplierTypes: SupplierType[];
  initialSortBy: "name" | "country" | "created_at";
  initialSortOrder: "asc" | "desc";
  brandId: string;
}

export function SuppliersPageClient({
  initialSuppliers,
  countries,
  initialSearch,
  initialCountry,
  initialSupplierTypes,
  initialSortBy,
  initialSortOrder,
  brandId,
}: SuppliersPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/dashboard/suppliers?${params.toString()}`);
  };

  const handleSort = (
    field: "name" | "country" | "created_at",
    order: "asc" | "desc"
  ) => {
    updateSearchParams({ sortBy: field, sortOrder: order });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams({ search: value || null, page: null });
  };

  const handleCountryChange = (value: string) => {
    updateSearchParams({ country: value || null, page: null });
  };

  const handleSupplierTypesChange = (types: SupplierType[]) => {
    updateSearchParams({
      types: types.length > 0 ? types.join(",") : null,
      page: null,
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this supplier? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete supplier");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Failed to delete supplier. Please try again.");
    }
  };

  // TODO: Implement CSV export and bulk delete features

  // Empty state
  if (
    initialSuppliers.length === 0 &&
    !initialSearch &&
    !initialCountry &&
    initialSupplierTypes.length === 0
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-navy">Suppliers</h1>
            <p className="mt-2 text-gray-600">
              Manage your supplier network and track certifications.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptySuppliers />
          <AddSupplierModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            brandId={brandId}
          />
        </div>

        <AddSupplierModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          brandId={brandId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-navy">Suppliers</h1>
          <p className="mt-2 text-gray-600">
            Manage your supplier network and track certifications.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {/* Filters and Table */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SupplierFilters
            search={initialSearch}
            country={initialCountry}
            supplierTypes={initialSupplierTypes}
            countries={countries}
            onSearchChange={handleSearchChange}
            onCountryChange={handleCountryChange}
            onSupplierTypesChange={handleSupplierTypesChange}
          />
        </div>

        {/* Table */}
        <div className="lg:col-span-3">
          <SupplierTable
            suppliers={initialSuppliers}
            onSort={handleSort}
            sortField={initialSortBy}
            sortOrder={initialSortOrder}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brandId={brandId}
      />
    </div>
  );
}
