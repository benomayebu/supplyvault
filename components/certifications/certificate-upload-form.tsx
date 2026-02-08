"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { CertificationType } from "@prisma/client";

interface CertificateUploadFormProps {
  supplierId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const certificationTypes: { value: CertificationType; label: string }[] = [
  { value: "GOTS", label: "GOTS - Global Organic Textile Standard" },
  { value: "OEKO_TEX", label: "OEKO-TEX Standard 100" },
  { value: "SA8000", label: "SA8000 - Social Accountability" },
  { value: "BSCI", label: "BSCI - Business Social Compliance Initiative" },
  { value: "FAIR_WEAR", label: "Fair Wear Foundation" },
  { value: "ISO14001", label: "ISO 14001 - Environmental Management" },
  { value: "OTHER", label: "Other Certification" },
];

export function CertificateUploadForm({
  supplierId,
  onSuccess,
  onCancel,
}: CertificateUploadFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form fields
  const [certificationType, setCertificationType] =
    useState<CertificationType>("GOTS");
  const [certificationName, setCertificationName] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF, JPG, or PNG file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (
      !certificationName ||
      !certificateNumber ||
      !issuingBody ||
      !issueDate ||
      !expiryDate
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate expiry date is in the future
    if (new Date(expiryDate) < new Date()) {
      setError("Expiry date must be in the future");
      return;
    }

    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("supplierId", supplierId);
      formData.append("certificationType", certificationType);
      formData.append("certificationName", certificationName);
      formData.append("certificateNumber", certificateNumber);
      formData.append("issuingBody", issuingBody);
      formData.append("issueDate", issueDate);
      formData.append("expiryDate", expiryDate);

      const response = await fetch("/api/certifications/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload certificate");
      }

      // Success - refresh page and notify
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload certificate"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Certification Type */}
      <div>
        <label
          htmlFor="certificationType"
          className="block text-sm font-medium text-gray-700"
        >
          Certification Type <span className="text-red-500">*</span>
        </label>
        <select
          id="certificationType"
          value={certificationType}
          onChange={(e) =>
            setCertificationType(e.target.value as CertificationType)
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary-teal focus:outline-none focus:ring-secondary-teal"
          required
        >
          {certificationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Certification Name */}
      <div>
        <label
          htmlFor="certificationName"
          className="block text-sm font-medium text-gray-700"
        >
          Certification Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="certificationName"
          value={certificationName}
          onChange={(e) => setCertificationName(e.target.value)}
          placeholder="e.g., GOTS Organic Textile Standard"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary-teal focus:outline-none focus:ring-secondary-teal"
          required
        />
      </div>

      {/* Certificate Number */}
      <div>
        <label
          htmlFor="certificateNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Certificate Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="certificateNumber"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
          placeholder="e.g., CU 827969"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary-teal focus:outline-none focus:ring-secondary-teal"
          required
        />
      </div>

      {/* Issuing Body */}
      <div>
        <label
          htmlFor="issuingBody"
          className="block text-sm font-medium text-gray-700"
        >
          Issuing Body <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="issuingBody"
          value={issuingBody}
          onChange={(e) => setIssuingBody(e.target.value)}
          placeholder="e.g., Control Union"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary-teal focus:outline-none focus:ring-secondary-teal"
          required
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="issueDate"
            className="block text-sm font-medium text-gray-700"
          >
            Issue Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="issueDate"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary-teal focus:outline-none focus:ring-secondary-teal"
            required
          />
        </div>

        <div>
          <label
            htmlFor="expiryDate"
            className="block text-sm font-medium text-gray-700"
          >
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary-teal focus:outline-none focus:ring-secondary-teal"
            required
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Certificate Document <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          {!selectedFile ? (
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:border-secondary-teal hover:bg-gray-100"
            >
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload certificate
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, JPG, or PNG (max 10MB)
              </p>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-secondary-teal" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 border-t pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isUploading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Certificate
            </>
          )}
        </button>
      </div>
    </form>
  );
}
