"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Lazy load upload form component
const UploadForm = dynamic(
  () => import("./upload-form").then((mod) => ({ default: mod.UploadForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">
          Loading upload form...
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface UploadPageClientProps {
  supplierId: string;
  supplierName: string;
}

export function UploadPageClient({
  supplierId,
  supplierName,
}: UploadPageClientProps) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push(`/dashboard/suppliers/${supplierId}`);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <Link
          href={`/dashboard/suppliers/${supplierId}`}
          className="inline-flex items-center gap-2 text-sm text-primary-navy hover:text-secondary-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Supplier
        </Link>

        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              Certification Uploaded Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Redirecting to supplier page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/suppliers/${supplierId}`}
          className="inline-flex items-center gap-2 text-sm text-primary-navy hover:text-secondary-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Supplier
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-primary-navy">
          Upload Certification
        </h1>
        <p className="mt-2 text-gray-600">
          Add a new certification for <strong>{supplierName}</strong>
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <UploadForm supplierId={supplierId} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
