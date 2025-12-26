"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  Upload,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import {
  SupplierType,
  CertificationStatus,
  CertificationType,
} from "@prisma/client";
import { format } from "date-fns";
import { clsx } from "clsx";

interface SupplierDetailClientProps {
  supplier: {
    id: string;
    name: string;
    country: string;
    supplier_type: SupplierType;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    created_at: Date;
  };
  certifications: Array<{
    id: string;
    certification_type: CertificationType;
    certification_name: string;
    issuing_body: string;
    issue_date: Date;
    expiry_date: Date;
    status: CertificationStatus;
  }>;
}

const supplierTypeLabels: Record<SupplierType, string> = {
  FABRIC_MILL: "Fabric Mill",
  DYE_HOUSE: "Dye House",
  GARMENT_FACTORY: "Garment Factory",
  TRIM_SUPPLIER: "Trim Supplier",
  OTHER: "Other",
};

const certificationTypeLabels: Record<CertificationType, string> = {
  GOTS: "GOTS",
  OEKO_TEX: "OEKO-TEX",
  SA8000: "SA8000",
  BSCI: "BSCI",
  FAIR_WEAR: "Fair Wear",
  ISO14001: "ISO 14001",
  OTHER: "Other",
};

const statusColors: Record<CertificationStatus, string> = {
  VALID: "bg-green-100 text-green-800",
  EXPIRING_SOON: "bg-yellow-100 text-yellow-800",
  EXPIRED: "bg-red-100 text-red-800",
};

const statusIcons: Record<CertificationStatus, typeof CheckCircle2> = {
  VALID: CheckCircle2,
  EXPIRING_SOON: AlertTriangle,
  EXPIRED: XCircle,
};

const statusLabels: Record<CertificationStatus, string> = {
  VALID: "Valid",
  EXPIRING_SOON: "Expiring Soon",
  EXPIRED: "Expired",
};

export function SupplierDetailClient({
  supplier,
  certifications,
}: SupplierDetailClientProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/reports/supplier-compliance?supplierId=${supplier.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `supplier-compliance-report-${supplier.name.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${supplier.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/suppliers/${supplier.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete supplier");
      }

      router.push("/dashboard/suppliers");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Failed to delete supplier. Please try again.");
    }
  };

  const validCount = certifications.filter((c) => c.status === "VALID").length;
  const expiringCount = certifications.filter(
    (c) => c.status === "EXPIRING_SOON"
  ).length;
  const expiredCount = certifications.filter(
    (c) => c.status === "EXPIRED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/suppliers"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary-navy">
              {supplier.name}
            </h1>
            <p className="mt-1 text-gray-600">
              Supplier Details & Certifications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary-teal px-4 py-2 text-sm font-medium text-white hover:bg-secondary-teal/90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Generating..." : "Export Report"}
          </button>
          <Link
            href={`/dashboard/suppliers/${supplier.id}/upload`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
          >
            <Upload className="h-4 w-4" />
            Upload Certification
          </Link>
          <Link
            href={`/dashboard/suppliers/${supplier.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Supplier Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary-navy" />
            <div>
              <p className="text-sm font-medium text-gray-600">Supplier Type</p>
              <p className="mt-1 text-lg font-semibold text-primary-navy">
                {supplierTypeLabels[supplier.supplier_type]}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary-navy" />
            <div>
              <p className="text-sm font-medium text-gray-600">Country</p>
              <p className="mt-1 text-lg font-semibold text-primary-navy">
                {supplier.country}
              </p>
            </div>
          </div>
        </div>

        {supplier.contact_email && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary-navy" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <a
                  href={`mailto:${supplier.contact_email}`}
                  className="mt-1 text-lg font-semibold text-secondary-teal hover:underline"
                >
                  {supplier.contact_email}
                </a>
              </div>
            </div>
          </div>
        )}

        {supplier.contact_phone && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary-navy" />
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <a
                  href={`tel:${supplier.contact_phone}`}
                  className="mt-1 text-lg font-semibold text-secondary-teal hover:underline"
                >
                  {supplier.contact_phone}
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary-navy" />
            <div>
              <p className="text-sm font-medium text-gray-600">Added</p>
              <p className="mt-1 text-lg font-semibold text-primary-navy">
                {format(new Date(supplier.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {supplier.address && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-navy" />
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="mt-1 text-lg font-semibold text-primary-navy">
                  {supplier.address}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Certification Stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-navy" />
          <h2 className="text-xl font-bold text-primary-navy">
            Certification Overview
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-navy">
              {certifications.length}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{validCount}</p>
            <p className="text-sm text-gray-600">Valid</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {expiringCount}
            </p>
            <p className="text-sm text-gray-600">Expiring</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{expiredCount}</p>
            <p className="text-sm text-gray-600">Expired</p>
          </div>
        </div>
      </div>

      {/* Certifications List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-primary-navy">
            Certifications ({certifications.length})
          </h2>
        </div>
        {certifications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No certifications yet</p>
            <Link
              href={`/dashboard/suppliers/${supplier.id}/upload`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
            >
              <Upload className="h-4 w-4" />
              Upload First Certification
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Issuing Body
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {certifications.map((cert) => {
                  const StatusIcon = statusIcons[cert.status];
                  return (
                    <tr
                      key={cert.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {certificationTypeLabels[cert.certification_type]}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary-navy">
                        <Link
                          href={`/dashboard/certifications/${cert.id}`}
                          className="hover:text-secondary-teal"
                        >
                          {cert.certification_name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {cert.issuing_body}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {format(new Date(cert.issue_date), "MMM d, yyyy")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {format(new Date(cert.expiry_date), "MMM d, yyyy")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            statusColors[cert.status]
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[cert.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/certifications/${cert.id}`}
                          className="text-secondary-teal hover:text-secondary-teal/80"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
