"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileCheck, Search, Filter } from "lucide-react";
import { CertificationStatus } from "@prisma/client";
import Link from "next/link";

interface Certification {
  id: string;
  certification_type: string;
  certification_name: string;
  issuing_body: string;
  issue_date: Date;
  expiry_date: Date | null;
  document_url: string | null;
  status: CertificationStatus;
  created_at: Date;
  supplier: {
    id: string;
    name: string;
    country: string;
  };
}

interface CertificationsPageClientProps {
  initialCertifications: Certification[];
  total: number;
  hasMore: boolean;
  initialSearch: string;
  initialStatus?: CertificationStatus;
  initialSortBy: string;
  initialSortOrder: string;
  currentPage: number;
  brandId: string;
}

export function CertificationsPageClient({
  initialCertifications,
  total,
  hasMore,
  initialSearch,
  initialStatus,
  currentPage,
}: CertificationsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<CertificationStatus | undefined>(
    initialStatus
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/dashboard/certifications?${params.toString()}`);
  };

  const handleStatusFilter = (value: string) => {
    const newStatus =
      value === "all" ? undefined : (value as CertificationStatus);
    setStatus(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`/dashboard/certifications?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/dashboard/certifications?${params.toString()}`);
  };

  const getStatusColor = (status: CertificationStatus) => {
    switch (status) {
      case "VALID":
        return "bg-green-100 text-green-800";
      case "EXPIRING_SOON":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "PENDING_REVIEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiryDate: Date | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-navy">Certifications</h1>
        <p className="mt-2 text-gray-600">
          Manage and track all supplier certifications
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search certifications..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={status || "all"}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            >
              <option value="all">All Status</option>
              <option value="VALID">Valid</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="PENDING_REVIEW">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {initialCertifications.length} of {total} certifications
      </div>

      {/* Certifications list */}
      {initialCertifications.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No certifications found
          </h3>
          <p className="mt-2 text-gray-600">
            {search
              ? "Try adjusting your search or filters"
              : "Start by adding suppliers and their certifications"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expiry Date
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
              {initialCertifications.map((cert) => {
                const daysUntilExpiry = getDaysUntilExpiry(cert.expiry_date);
                return (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {cert.certification_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cert.issuing_body}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        href={`/dashboard/suppliers/${cert.supplier.id}`}
                        className="text-secondary-teal hover:underline"
                      >
                        {cert.supplier.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {cert.certification_type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">
                          {formatDate(cert.expiry_date)}
                        </div>
                        {daysUntilExpiry !== null && (
                          <div
                            className={`text-xs ${
                              daysUntilExpiry < 0
                                ? "text-red-600"
                                : daysUntilExpiry < 30
                                  ? "text-yellow-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {daysUntilExpiry < 0
                              ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                              : `${daysUntilExpiry} days remaining`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(cert.status)}`}
                      >
                        {cert.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/certifications/${cert.id}`}
                        className="text-secondary-teal hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasMore}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
