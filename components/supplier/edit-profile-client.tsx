"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SupplierType } from "@prisma/client";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

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

interface EditProfileClientProps {
  supplier: {
    id: string;
    name: string;
    country: string;
    address: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    supplier_type: SupplierType | null;
    manufacturing_capabilities: string | null;
  };
}

export default function EditProfileClient({
  supplier,
}: EditProfileClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const existingCapabilities = supplier.manufacturing_capabilities
    ? JSON.parse(supplier.manufacturing_capabilities)
    : [];

  const [formData, setFormData] = useState({
    name: supplier.name,
    country: supplier.country,
    address: supplier.address || "",
    contact_email: supplier.contact_email || "",
    contact_phone: supplier.contact_phone || "",
    supplier_type: supplier.supplier_type || "",
    capabilities: existingCapabilities as string[],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      const response = await fetch("/api/suppliers/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          country: formData.country,
          address: formData.address,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          supplier_type: formData.supplier_type,
          manufacturing_capabilities: JSON.stringify(formData.capabilities),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      showSuccessToast("Profile updated successfully!");
      router.push("/supplier/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
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
              name="country"
              required
              value={formData.country}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
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
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label
              htmlFor="contact_email"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Email
            </label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label
              htmlFor="contact_phone"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Phone
            </label>
            <input
              type="tel"
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
            />
          </div>

          {/* Supplier Type */}
          <div>
            <label
              htmlFor="supplier_type"
              className="block text-sm font-medium text-gray-700"
            >
              Supplier Type
            </label>
            <select
              id="supplier_type"
              name="supplier_type"
              value={formData.supplier_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#3BCEAC] focus:outline-none focus:ring-1 focus:ring-[#3BCEAC]"
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
            <label className="block text-sm font-medium text-gray-700">
              Manufacturing Capabilities
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {MANUFACTURING_CAPABILITIES.map((capability) => (
                <label
                  key={capability}
                  className="flex items-center gap-2 rounded border border-gray-300 px-3 py-2 hover:bg-gray-50"
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
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
