"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SupplierType, VerificationStatus } from "@prisma/client";

interface ConnectedSupplier {
  connection_id: string;
  connected_at: Date;
  notes: string | null;
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
    className: "bg-green-100 text-green-800",
  },
  BASIC: {
    label: "Basic",
    className: "bg-blue-100 text-blue-800",
  },
  UNVERIFIED: {
    label: "Unverified",
    className: "bg-gray-100 text-gray-800",
  },
};

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  FABRIC_MILL: "Fabric Mill",
  DYE_HOUSE: "Dye House",
  GARMENT_FACTORY: "Garment Factory",
  TRIM_SUPPLIER: "Trim Supplier",
  OTHER: "Other",
};

export default function MySuppliersClient() {
  const [suppliers, setSuppliers] = useState<ConnectedSupplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySuppliers();
  }, []);

  const fetchMySuppliers = async () => {
    try {
      const response = await fetch("/api/connections/list");
      if (!response.ok) throw new Error("Failed to fetch suppliers");

      const data = await response.json();
      setSuppliers(data.connections);
    } catch (error) {
      console.error("Error fetching my suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading your suppliers...</div>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No suppliers yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Start building your supplier network by discovering suppliers
          </p>
          <Link
            href="/brand/suppliers/discover"
            className="mt-6 inline-flex items-center rounded-lg bg-[#3BCEAC] px-6 py-3 font-medium text-white hover:bg-[#3BCEAC]/90"
          >
            Discover Suppliers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-600">
            Total Suppliers
          </div>
          <div className="mt-2 text-3xl font-bold text-[#3BCEAC]">
            {suppliers.length}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-600">
            Total Certifications
          </div>
          <div className="mt-2 text-3xl font-bold text-[#3BCEAC]">
            {suppliers.reduce(
              (sum, s) => sum + s.supplier.certificationCount,
              0
            )}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-600">
            Verified Suppliers
          </div>
          <div className="mt-2 text-3xl font-bold text-[#3BCEAC]">
            {
              suppliers.filter(
                (s) => s.supplier.verification_status === "VERIFIED"
              ).length
            }
          </div>
        </div>
      </div>

      {/* Supplier List */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Supplier Network
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {suppliers.map((connection) => {
            const supplier = connection.supplier;
            const badge = VERIFICATION_BADGES[supplier.verification_status];

            return (
              <Link
                key={connection.connection_id}
                href={`/brand/suppliers/${supplier.id}`}
                className="block px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {supplier.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                      <span>📍 {supplier.country}</span>
                      {supplier.supplier_type && (
                        <span>
                          {SUPPLIER_TYPE_LABELS[supplier.supplier_type]}
                        </span>
                      )}
                      <span>
                        {supplier.certificationCount} certification
                        {supplier.certificationCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {supplier.capabilities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {supplier.capabilities.slice(0, 3).map((cap, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {cap}
                          </span>
                        ))}
                        {supplier.capabilities.length > 3 && (
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                            +{supplier.capabilities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    {connection.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        Note: {connection.notes}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-right text-sm text-gray-500">
                    <div>
                      Added{" "}
                      {new Date(connection.connected_at).toLocaleDateString()}
                    </div>
                    <span className="mt-2 inline-flex text-[#3BCEAC]">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 text-center">
        <Link
          href="/brand/suppliers/discover"
          className="inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Discover More Suppliers
        </Link>
      </div>
    </div>
  );
}
