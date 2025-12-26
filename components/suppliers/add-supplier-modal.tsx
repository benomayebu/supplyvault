"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  address: z.string().optional(),
  supplier_type: z.enum([
    "FABRIC_MILL",
    "DYE_HOUSE",
    "GARMENT_FACTORY",
    "TRIM_SUPPLIER",
    "OTHER",
  ]),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
}

export function AddSupplierModal({
  isOpen,
  onClose,
  brandId,
}: AddSupplierModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    contact_email: "",
    contact_phone: "",
    country: "",
    address: "",
    supplier_type: "OTHER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = supplierSchema.parse({
        ...formData,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
        address: formData.address || undefined,
      });

      setIsSubmitting(true);

      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validated,
          brand_id: brandId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create supplier");
      }

      router.refresh();
      onClose();
      setFormData({
        name: "",
        contact_email: "",
        contact_phone: "",
        country: "",
        address: "",
        supplier_type: "OTHER",
      });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-xl font-semibold text-primary-navy">
          Add New Supplier
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="contact_email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contact_email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="contact_phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            />
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              value={formData.country}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
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
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            />
          </div>

          {/* Supplier Type */}
          <div>
            <label
              htmlFor="supplier_type"
              className="block text-sm font-medium text-gray-700"
            >
              Supplier Type <span className="text-red-500">*</span>
            </label>
            <select
              id="supplier_type"
              name="supplier_type"
              required
              value={formData.supplier_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            >
              <option value="FABRIC_MILL">Fabric Mill</option>
              <option value="DYE_HOUSE">Dye House</option>
              <option value="GARMENT_FACTORY">Garment Factory</option>
              <option value="TRIM_SUPPLIER">Trim Supplier</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.supplier_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.supplier_type}
              </p>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
