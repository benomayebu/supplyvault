"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SupplierType,
  VerificationStatus,
  Certification,
} from "@prisma/client";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface SupplierDetailViewProps {
  supplier: {
    id: string;
    name: string;
    country: string;
    address: string | null;
    supplier_type: SupplierType | null;
    verification_status: VerificationStatus;
    manufacturing_capabilities: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: Date;
    certifications: Certification[];
  };
}

const VERIFICATION_BADGES = {
  VERIFIED: {
    label: "Verified Supplier",
    className: "bg-green-100 text-green-800 border-green-200",
    description: "This supplier has been verified by our team",
  },
  BASIC: {
    label: "Basic Verification",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Basic verification completed",
  },
  UNVERIFIED: {
    label: "Unverified",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    description: "This supplier has not been verified yet",
  },
};

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  FABRIC_MILL: "Fabric Mill",
  DYE_HOUSE: "Dye House",
  GARMENT_FACTORY: "Garment Factory",
  TRIM_SUPPLIER: "Trim Supplier",
  OTHER: "Other",
};

export default function SupplierDetailViewWithConnection({
  supplier,
}: SupplierDetailViewProps) {
  const badge = VERIFICATION_BADGES[supplier.verification_status];
  const capabilities = supplier.manufacturing_capabilities
    ? JSON.parse(supplier.manufacturing_capabilities)
    : [];

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if already connected
  useEffect(() => {
    checkConnectionStatus();
  }, [supplier.id]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/connections/list");
      if (response.ok) {
        const data = await response.json();
        const connected = data.connections.some(
          (conn: any) => conn.supplier.id === supplier.id
        );
        setIsConnected(connected);
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAddToSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/connections/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplier.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add supplier");
      }

      setIsConnected(true);
      showSuccessToast("Supplier added to your network!");
    } catch (error) {
      console.error("Error adding supplier:", error);
      showErrorToast(
        error instanceof Error ? error.message : "Failed to add supplier"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromSuppliers = async () => {
    if (!confirm("Are you sure you want to remove this supplier?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/connections/remove?supplier_id=${supplier.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove supplier");
      }

      setIsConnected(false);
      showSuccessToast("Supplier removed from your network");
    } catch (error) {
      console.error("Error removing supplier:", error);
      showErrorToast(
        error instanceof Error ? error.message : "Failed to remove supplier"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/brand/suppliers/discover"
            className="mb-4 inline-flex items-center text-sm text-white/80 hover:text-white"
          >
            ← Back to Suppliers
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{supplier.name}</h1>
              <p className="mt-2 text-white/80">
                📍 {supplier.country}
                {supplier.supplier_type &&
                  ` • ${SUPPLIER_TYPE_LABELS[supplier.supplier_type]}`}
              </p>
            </div>
            {isConnected && (
              <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-white">
                ✓ Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Verification Status */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${badge.className}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{badge.label}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{badge.description}</p>
            </div>

            {/* Capabilities */}
            {capabilities.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Manufacturing Capabilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((capability: string, index: number) => (
                    <span
                      key={index}
                      className="rounded bg-[#3BCEAC]/10 px-3 py-1 text-sm font-medium text-[#3BCEAC]"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Certifications ({supplier.certifications.length})
              </h2>
              {supplier.certifications.length > 0 ? (
                <div className="space-y-4">
                  {supplier.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {cert.certification_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {cert.certification_type}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Issued by {cert.issuing_body}
                          </p>
                        </div>
                        <div
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            cert.status === "VALID"
                              ? "bg-green-100 text-green-800"
                              : cert.status === "EXPIRING_SOON"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cert.status.replace("_", " ")}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Issued:{" "}
                          {new Date(cert.issue_date).toLocaleDateString()}
                        </span>
                        <span>
                          Expires:{" "}
                          {new Date(cert.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No certifications uploaded yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Contact Info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 font-semibold text-gray-900">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                {supplier.contact_email && (
                  <div>
                    <div className="font-medium text-gray-700">Email</div>
                    <a
                      href={`mailto:${supplier.contact_email}`}
                      className="text-[#3BCEAC] hover:underline"
                    >
                      {supplier.contact_email}
                    </a>
                  </div>
                )}
                {supplier.contact_phone && (
                  <div>
                    <div className="font-medium text-gray-700">Phone</div>
                    <a
                      href={`tel:${supplier.contact_phone}`}
                      className="text-[#3BCEAC] hover:underline"
                    >
                      {supplier.contact_phone}
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div>
                    <div className="font-medium text-gray-700">Address</div>
                    <p className="text-gray-600">{supplier.address}</p>
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-700">Member Since</div>
                  <p className="text-gray-600">
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="rounded-lg bg-white p-6 shadow">
              {checkingStatus ? (
                <div className="text-center text-sm text-gray-500">
                  Checking status...
                </div>
              ) : isConnected ? (
                <>
                  <div className="mb-3 rounded-lg bg-green-50 p-3 text-center text-sm text-green-800">
                    ✓ This supplier is in your network
                  </div>
                  <button
                    onClick={handleRemoveFromSuppliers}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-red-300 px-4 py-3 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Removing..." : "Remove from My Suppliers"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddToSuppliers}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-[#3BCEAC] px-4 py-3 font-medium text-white hover:bg-[#3BCEAC]/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Adding..." : "Add to My Suppliers"}
                </button>
              )}
              <button className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">
                Request Information
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
