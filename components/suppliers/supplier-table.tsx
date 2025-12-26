"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SupplierRow } from "./supplier-row";
import { SupplierWithCertCount } from "@/lib/suppliers";

type SortField = "name" | "country" | "created_at";
type SortOrder = "asc" | "desc";

interface SupplierTableProps {
  suppliers: SupplierWithCertCount[];
  onSort: (field: SortField, order: SortOrder) => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onDelete: (id: string) => void;
}

export function SupplierTable({
  suppliers,
  onSort,
  sortField,
  sortOrder,
  onDelete,
}: SupplierTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(suppliers.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const allSelected =
    suppliers.length > 0 && selectedIds.size === suppliers.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < suppliers.length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSort(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(field, "asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4 text-primary-navy" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-primary-navy" />
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-navy focus:ring-secondary-teal"
                  aria-label="Select all suppliers"
                />
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-primary-navy"
                >
                  Supplier Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("country")}
                  className="flex items-center text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-primary-navy"
                >
                  Country
                  <SortIcon field="country" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Supplier Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                # of Certifications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {suppliers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No suppliers found.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <SupplierRow
                  key={supplier.id}
                  supplier={supplier}
                  isSelected={selectedIds.has(supplier.id)}
                  onSelect={handleSelect}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedIds.size > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
          <p className="text-sm text-gray-700">
            {selectedIds.size} supplier{selectedIds.size !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>
      )}
    </div>
  );
}
