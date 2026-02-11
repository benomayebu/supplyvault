"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

const CERTIFICATION_TYPES = [
  { value: "GOTS", label: "GOTS - Global Organic Textile Standard" },
  { value: "OEKO_TEX", label: "OEKO-TEX Standard 100" },
  { value: "SA8000", label: "SA8000 - Social Accountability" },
  { value: "BSCI", label: "BSCI - Business Social Compliance" },
  { value: "FAIR_WEAR", label: "Fair Wear Foundation" },
  { value: "ISO14001", label: "ISO 14001 - Environmental Management" },
  { value: "OTHER", label: "Other Certification" },
];

export default function UploadCertificateClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    data: {
      confidence: number;
      [key: string]: string | number;
    };
    warnings?: string[];
  } | null>(null);
  const [formData, setFormData] = useState({
    certification_type: "",
    certification_name: "",
    issuing_body: "",
    issue_date: "",
    expiry_date: "",
    certificate_number: "",
    scope: "",
    file: null as File | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
      // Clear any previous parsed data when file changes
      setParsedData(null);
    }
  };

  const handleAIParse = async () => {
    if (!formData.file) {
      showErrorToast("Please select a file first");
      return;
    }

    if (formData.file.type !== "application/pdf") {
      showErrorToast("AI parsing only works with PDF files");
      return;
    }

    setIsParsing(true);

    try {
      const parseFormData = new FormData();
      parseFormData.append("file", formData.file);

      const response = await fetch("/api/certifications/parse", {
        method: "POST",
        body: parseFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse certificate");
      }

      // Auto-fill form with parsed data
      setFormData((prev) => ({
        ...prev,
        certification_type:
          result.data.certification_type || prev.certification_type,
        certification_name:
          result.data.certification_name || prev.certification_name,
        issuing_body: result.data.issuing_body || prev.issuing_body,
        issue_date: result.data.issue_date || prev.issue_date,
        expiry_date: result.data.expiry_date || prev.expiry_date,
        certificate_number:
          result.data.certificate_number || prev.certificate_number,
        scope: result.data.scope || prev.scope,
      }));

      setParsedData(result);

      if (result.warnings && result.warnings.length > 0) {
        showErrorToast(
          `Data extracted! Please review: ${result.warnings.join(", ")}`
        );
      } else {
        showSuccessToast(
          `Data extracted successfully! Confidence: ${Math.round(result.data.confidence * 100)}%`
        );
      }
    } catch (error) {
      console.error("AI parsing error:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to parse certificate. Please enter data manually."
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if file is provided and should be uploaded
      if (formData.file) {
        // Use FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.file);
        uploadFormData.append(
          "certification_type",
          formData.certification_type
        );
        uploadFormData.append(
          "certification_name",
          formData.certification_name
        );
        uploadFormData.append("issuing_body", formData.issuing_body);
        uploadFormData.append("issue_date", formData.issue_date);
        uploadFormData.append("expiry_date", formData.expiry_date);

        const response = await fetch("/api/certifications/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload certification");
        }

        showSuccessToast("Certification uploaded successfully!");
        router.push("/supplier/dashboard");
      } else {
        // Use JSON for non-file upload
        const response = await fetch("/api/certifications/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            certification_type: formData.certification_type,
            certification_name: formData.certification_name,
            issuing_body: formData.issuing_body,
            issue_date: formData.issue_date,
            expiry_date: formData.expiry_date,
            certificate_number: formData.certificate_number,
            scope: formData.scope,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload certification");
        }

        showSuccessToast("Certification uploaded successfully!");
        router.push("/supplier/dashboard");
      }
    } catch (error) {
      console.error("Error uploading certification:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to upload certification"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Certification Type */}
          <div>
            <label
              htmlFor="certification_type"
              className="block text-sm font-medium text-gray-700"
            >
              Certification Type *
            </label>
            <select
              id="certification_type"
              name="certification_type"
              required
              value={formData.certification_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
            >
              <option value="">Select a certification type</option>
              {CERTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Certification Name */}
          <div>
            <label
              htmlFor="certification_name"
              className="block text-sm font-medium text-gray-700"
            >
              Certification Name *
            </label>
            <input
              type="text"
              id="certification_name"
              name="certification_name"
              required
              value={formData.certification_name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
              placeholder="e.g., GOTS Organic Cotton Certification"
            />
          </div>

          {/* Issuing Body */}
          <div>
            <label
              htmlFor="issuing_body"
              className="block text-sm font-medium text-gray-700"
            >
              Issuing Body *
            </label>
            <input
              type="text"
              id="issuing_body"
              name="issuing_body"
              required
              value={formData.issuing_body}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
              placeholder="e.g., Control Union"
            />
          </div>

          {/* Certificate Number */}
          <div>
            <label
              htmlFor="certificate_number"
              className="block text-sm font-medium text-gray-700"
            >
              Certificate Number
            </label>
            <input
              type="text"
              id="certificate_number"
              name="certificate_number"
              value={formData.certificate_number}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
              placeholder="e.g., CU123456"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="issue_date"
                className="block text-sm font-medium text-gray-700"
              >
                Issue Date *
              </label>
              <input
                type="date"
                id="issue_date"
                name="issue_date"
                required
                value={formData.issue_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
              />
            </div>
            <div>
              <label
                htmlFor="expiry_date"
                className="block text-sm font-medium text-gray-700"
              >
                Expiry Date *
              </label>
              <input
                type="date"
                id="expiry_date"
                name="expiry_date"
                required
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
              />
            </div>
          </div>

          {/* Scope */}
          <div>
            <label
              htmlFor="scope"
              className="block text-sm font-medium text-gray-700"
            >
              Scope / Description
            </label>
            <textarea
              id="scope"
              name="scope"
              rows={3}
              value={formData.scope}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
              placeholder="Describe what this certification covers..."
            />
          </div>

          {/* File Upload */}
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Certificate Document
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-[#3BCEAC] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3BCEAC]/90"
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload PDF, JPEG, or PNG (max 10MB)
            </p>
            {formData.file && (
              <div className="mt-2 flex items-center gap-2 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {formData.file.name} (
                  {(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}

            {/* AI Auto-Fill Button */}
            {formData.file && formData.file.type === "application/pdf" && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleAIParse}
                  disabled={isParsing}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-[#3BCEAC] bg-[#3BCEAC]/10 px-4 py-2 text-sm font-medium text-[#3BCEAC] hover:bg-[#3BCEAC]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isParsing ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Extracting data with AI...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>✨ Auto-fill from PDF with AI</span>
                    </>
                  )}
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  AI will extract certification details from your PDF
                </p>
              </div>
            )}

            {/* Show confidence score if available */}
            {parsedData && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">AI Extraction Complete!</span>
                    <br />
                    <span className="text-xs">
                      Confidence: {Math.round(parsedData.data.confidence * 100)}
                      % • Please review all fields before submitting
                    </span>
                  </div>
                </div>
                {parsedData.warnings && parsedData.warnings.length > 0 && (
                  <div className="mt-2 text-xs text-blue-700">
                    ⚠️ {parsedData.warnings.join(" • ")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-[#3BCEAC] px-4 py-3 font-medium text-white hover:bg-[#3BCEAC]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Uploading..." : "Upload Certification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
