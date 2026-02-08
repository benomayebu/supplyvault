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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, we'll create the certification without file upload
      // File upload can be added later with proper storage setup
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

          {/* File Upload (Optional for now) */}
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Certificate File (PDF)
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-[#3BCEAC] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3BCEAC]/90"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Upload the certificate PDF (coming soon)
            </p>
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
