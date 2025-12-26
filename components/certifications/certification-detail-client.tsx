"use client";

import dynamic from "next/dynamic";
import { CertificationHeader } from "./cert-header";
import { CertificationType, AlertType } from "@prisma/client";

// Lazy load heavy components
const DocumentViewer = dynamic(
  () =>
    import("./document-viewer").then((mod) => ({
      default: mod.DocumentViewer,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-500">Loading document...</div>
      </div>
    ),
    ssr: false,
  }
);

const CertActions = dynamic(
  () => import("./cert-actions").then((mod) => ({ default: mod.CertActions })),
  {
    ssr: false,
  }
);

const AlertHistory = dynamic(
  () =>
    import("./alert-history").then((mod) => ({ default: mod.AlertHistory })),
  {
    ssr: false,
  }
);

interface CertificationDetailClientProps {
  certification: {
    id: string;
    certification_name: string;
    certification_type: CertificationType;
    issuing_body: string;
    issue_date: Date;
    expiry_date: Date;
    document_url: string;
    status: "VALID" | "EXPIRING_SOON" | "EXPIRED";
    supplier: {
      id: string;
      name: string;
    };
    alerts: Array<{
      id: string;
      alert_type: AlertType;
      sent_at: Date | null;
      is_read: boolean;
      created_at: Date;
    }>;
  };
}

export function CertificationDetailClient({
  certification,
}: CertificationDetailClientProps) {
  const handleDelete = () => {
    // This will be handled by the CertActions component
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CertificationHeader certification={certification} />

      {/* Actions */}
      <CertActions
        certificationId={certification.id}
        supplierId={certification.supplier.id}
        onDelete={handleDelete}
      />

      {/* Document Viewer */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-primary-navy">
          Certification Document
        </h2>
        <DocumentViewer
          documentUrl={certification.document_url}
          fileName={`${certification.certification_name}.pdf`}
        />
      </div>

      {/* Alert History */}
      <AlertHistory alerts={certification.alerts} />
    </div>
  );
}
