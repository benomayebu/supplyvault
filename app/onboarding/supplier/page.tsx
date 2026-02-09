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

const COUNTRIES = [
  "Bangladesh",
  "China",
  "India",
  "Vietnam",
  "Pakistan",
  "Turkey",
  "Indonesia",
  "Cambodia",
  "Sri Lanka",
  "Egypt",
  "Other",
];

const CAPABILITIES = [
  "Cotton Spinning",
  "Fabric Weaving",
  "Fabric Knitting",
  "Fabric Dyeing",
  "Fabric Printing",
  "Fabric Finishing",
  "Garment Cutting",
  "Garment Sewing",
  "Garment Finishing",
  "Quality Control",
  "Sampling",
  "Product Development",
];

export default function SupplierProfileSetup() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    country: "",
    address: "",
    registrationNumber: "",
    website: "",
    description: "",
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
    setError("");

    try {
      if (!formData.companyName || !formData.country || !formData.address) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.capabilities.length === 0) {
        throw new Error("Please select at least one manufacturing capability");
      }

      const response = await fetch("/api/suppliers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.companyName,
          country: formData.country,
          address: formData.address,
          registration_number: formData.registrationNumber,
          website: formData.website,
          description: formData.description,
          supplier_type: formData.supplierType,
          manufacturing_capabilities: JSON.stringify(formData.capabilities),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create supplier profile");
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

      router.push("/supplier/dashboard");
    } catch (err) {
      console.error("Error creating supplier profile:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create profile. Please try again.";
      setError(message);
      showErrorToast(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-navy to-primary-navy/90 p-4">
      <div className="w-full max-w-3xl">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-navy">
              Complete Your Supplier Profile
            </h1>
            <p className="mt-2 text-gray-600">
              This information will be visible to brands searching for suppliers
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

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
                placeholder="EcoFiber Textiles Ltd"
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
              <select
                id="country"
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Factory Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Factory Address *
              </label>
              <textarea
                id="address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
                placeholder="123 Factory Road, Dhaka"
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

            {/* Registration Number */}
            <div>
              <label
                htmlFor="registrationNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Company Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
                placeholder="BD-12345"
              />
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
                placeholder="https://www.ecofiber.com"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Company Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
                placeholder="Tell brands about your company, certifications, and specialties..."
              />
            </div>

            {/* Manufacturing Capabilities */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Manufacturing Capabilities * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CAPABILITIES.map((capability) => (
                  <label
                    key={capability}
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50 ${
                      formData.capabilities.includes(capability)
                        ? "border-[#3BCEAC] bg-[#3BCEAC]/5"
                        : "border-gray-300"
                    }`}
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

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-4">
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
                className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
                  isLoading
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-[#3BCEAC] text-white hover:bg-[#3BCEAC]/90"
                }`}
              >
                {isLoading ? "Creating Profile..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
