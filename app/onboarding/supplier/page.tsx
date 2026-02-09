"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { showErrorToast } from "@/lib/toast";

const SUPPLIER_TYPES = [
  { value: "FABRIC_MILL", label: "Fabric Mill" },
  { value: "DYE_HOUSE", label: "Dye House" },
  { value: "GARMENT_FACTORY", label: "Garment Factory" },
  { value: "TRIM_SUPPLIER", label: "Trim Supplier" },
  { value: "OTHER", label: "Other" },
];

const MANUFACTURING_CAPABILITIES = [
  "Organic Cotton",
  "Recycled Materials",
  "Low Water Usage",
  "Renewable Energy",
  "Fair Trade",
  "Small Batch Production",
  "Custom Design",
  "Fast Turnaround",
];

export default function SupplierProfileSetup() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    country: "",
    address: "",
    supplierType: "",
    capabilities: [] as string[],
  });

  const handleCapabilityToggle = (capability: string) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter((c) => c !== capability)
        : [...prev.capabilities, capability],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create supplier record
      const response = await fetch("/api/suppliers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.companyName,
          country: formData.country,
          address: formData.address,
          supplier_type: formData.supplierType,
          manufacturing_capabilities: JSON.stringify(formData.capabilities),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create supplier profile");
      }

      // Mark onboarding as complete in Clerk metadata
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            onboardingComplete: true,
          },
        });
      }

      // Redirect to supplier dashboard
      router.push("/supplier/dashboard");
    } catch (error) {
      console.error("Error creating supplier profile:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to create profile. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-navy to-primary-navy/90 p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-navy">
              Supplier Profile Setup
            </h1>
            <p className="mt-2 text-gray-600">
              Tell us about your manufacturing business
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name *
              </label>
              <input
                type="text"
                id="companyName"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
                placeholder="Your Company Name"
              />
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Country *
              </label>
              <input
                type="text"
                id="country"
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
                placeholder="e.g., Bangladesh, India, Vietnam"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
                placeholder="Full business address"
              />
            </div>

            {/* Supplier Type */}
            <div>
              <label
                htmlFor="supplierType"
                className="block text-sm font-medium text-gray-700"
              >
                Supplier Type *
              </label>
              <select
                id="supplierType"
                required
                value={formData.supplierType}
                onChange={(e) =>
                  setFormData({ ...formData, supplierType: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
              >
                <option value="">Select a type</option>
                {SUPPLIER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Manufacturing Capabilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturing Capabilities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MANUFACTURING_CAPABILITIES.map((capability) => (
                  <label
                    key={capability}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.capabilities.includes(capability)}
                      onChange={() => handleCapabilityToggle(capability)}
                      className="h-4 w-4 rounded border-gray-300 text-[#3BCEAC] focus:ring-[#3BCEAC]"
                    />
                    <span className="text-sm text-gray-700">{capability}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`rounded-lg px-6 py-2 font-semibold transition-colors ${
                  isLoading
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-[#3BCEAC] text-white hover:bg-[#3BCEAC]/90"
                }`}
              >
                {isLoading ? "Creating Profile..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
