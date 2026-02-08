"use client";

import { useState } from "react";
import { z } from "zod";
import { CertificationType } from "@prisma/client";
import { FileUploader } from "./file-uploader";
import { ChevronLeft, ChevronRight, Check, FileText } from "lucide-react";

const certificationTypes: { value: CertificationType; label: string }[] = [
  { value: "GOTS", label: "GOTS (Global Organic Textile Standard)" },
  { value: "OEKO_TEX", label: "OEKO-TEX Standard 100" },
  { value: "SA8000", label: "SA8000 (Social Accountability)" },
  { value: "BSCI", label: "BSCI (Business Social Compliance Initiative)" },
  { value: "FAIR_WEAR", label: "Fair Wear Foundation" },
  { value: "ISO14001", label: "ISO 14001 (Environmental Management)" },
  { value: "OTHER", label: "Other" },
];

const formSchema = z
  .object({
    certification_type: z.enum([
      "GOTS",
      "OEKO_TEX",
      "SA8000",
      "BSCI",
      "FAIR_WEAR",
      "ISO14001",
      "OTHER",
    ]),
    certification_name: z.string().min(1, "Certification name is required"),
    issuing_body: z.string().optional(),
    issue_date: z.string().min(1, "Issue date is required"),
    expiry_date: z.string().min(1, "Expiry date is required"),
    file: z.instanceof(File).optional(),
  })
  .refine(
    (data) => {
      if (!data.expiry_date || !data.issue_date) return true;
      return new Date(data.expiry_date) > new Date(data.issue_date);
    },
    {
      message: "Expiry date must be after issue date",
      path: ["expiry_date"],
    }
  )
  .refine(
    (data) => {
      return new Date(data.expiry_date) > new Date();
    },
    {
      message: "Expiry date must be in the future",
      path: ["expiry_date"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface UploadFormProps {
  supplierId: string;
  onSuccess: () => void;
}

export function UploadForm({ supplierId, onSuccess }: UploadFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.certification_type) {
        stepErrors.certification_type = "Certification type is required";
      }
      if (!formData.certification_name) {
        stepErrors.certification_name = "Certification name is required";
      }
      if (!formData.issue_date) {
        stepErrors.issue_date = "Issue date is required";
      }
      if (!formData.expiry_date) {
        stepErrors.expiry_date = "Expiry date is required";
      }
    }

    if (step === 2 && !selectedFile) {
      stepErrors.file = "Please select a file to upload";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const completeData = {
        ...formData,
        file: selectedFile,
      };

      const validated = formSchema.parse(completeData);

      if (!selectedFile) {
        throw new Error("No file selected");
      }

      setUploadProgress(20);

      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("supplierId", supplierId);
      uploadFormData.append("certificationType", validated.certification_type);
      uploadFormData.append("certificationName", validated.certification_name);
      uploadFormData.append("certificateNumber", ""); // Can be added to form if needed
      uploadFormData.append("issuingBody", validated.issuing_body || "");
      uploadFormData.append("issueDate", validated.issue_date);
      uploadFormData.append("expiryDate", validated.expiry_date);

      setUploadProgress(50);

      // Upload file and create certification in one API call
      const response = await fetch("/api/certifications/upload", {
        method: "POST",
        body: uploadFormData,
      });

      setUploadProgress(90);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload certification");
      }

      setUploadProgress(100);
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({
          submit: error instanceof Error ? error.message : "An error occurred",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-1 items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step === currentStep
                  ? "bg-secondary-teal text-white"
                  : step < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {step < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step}</span>
              )}
            </div>
            {step < 3 && (
              <div
                className={`h-1 flex-1 ${
                  step < currentStep ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Certification Details */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary-navy">
            Certification Details
          </h2>

          <div>
            <label
              htmlFor="certification_type"
              className="block text-sm font-medium text-gray-700"
            >
              Certification Type <span className="text-red-500">*</span>
            </label>
            <select
              id="certification_type"
              name="certification_type"
              value={formData.certification_type || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            >
              <option value="">Select certification type</option>
              {certificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.certification_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.certification_type}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="certification_name"
              className="block text-sm font-medium text-gray-700"
            >
              Certification Name <span className="text-red-500">*</span>
            </label>
            <input
              id="certification_name"
              name="certification_name"
              type="text"
              value={formData.certification_name || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            />
            {errors.certification_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.certification_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="issuing_body"
              className="block text-sm font-medium text-gray-700"
            >
              Issuing Body
            </label>
            <input
              id="issuing_body"
              name="issuing_body"
              type="text"
              value={formData.issuing_body || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="issue_date"
                className="block text-sm font-medium text-gray-700"
              >
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                id="issue_date"
                name="issue_date"
                type="date"
                value={formData.issue_date || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
              />
              {errors.issue_date && (
                <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="expiry_date"
                className="block text-sm font-medium text-gray-700"
              >
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                id="expiry_date"
                name="expiry_date"
                type="date"
                value={formData.expiry_date || ""}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
              />
              {errors.expiry_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.expiry_date}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Document Upload */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary-navy">
            Upload Document
          </h2>

          <FileUploader
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onRemove={() => setSelectedFile(null)}
            error={errors.file}
          />
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary-navy">
            Review & Confirm
          </h2>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-4 font-medium text-gray-900">
              Certification Details
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-gray-900">
                  {certificationTypes.find(
                    (t) => t.value === formData.certification_type
                  )?.label || formData.certification_type}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-gray-900">
                  {formData.certification_name}
                </dd>
              </div>
              {formData.issuing_body && (
                <div>
                  <dt className="font-medium text-gray-500">Issuing Body</dt>
                  <dd className="mt-1 text-gray-900">
                    {formData.issuing_body}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-gray-500">Issue Date</dt>
                <dd className="mt-1 text-gray-900">
                  {formData.issue_date
                    ? new Date(formData.issue_date).toLocaleDateString()
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Expiry Date</dt>
                <dd className="mt-1 text-gray-900">
                  {formData.expiry_date
                    ? new Date(formData.expiry_date).toLocaleDateString()
                    : ""}
                </dd>
              </div>
              {selectedFile && (
                <div className="col-span-2">
                  <dt className="font-medium text-gray-500">Document</dt>
                  <dd className="mt-1 flex items-center gap-2 text-gray-900">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Upload Progress */}
      {isSubmitting && uploadProgress > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-secondary-teal transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90 disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Upload Certification"}
          </button>
        )}
      </div>
    </div>
  );
}
