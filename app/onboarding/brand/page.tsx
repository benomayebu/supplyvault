"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CERTIFICATION_TYPES = [
  "GOTS (Global Organic Textile Standard)",
  "OEKO-TEX",
  "SA8000 (Social Accountability)",
  "BSCI (Business Social Compliance Initiative)",
  "Fair Wear Foundation",
  "ISO 14001 (Environmental Management)",
  "Fair Trade",
  "Bluesign",
];

export default function BrandProfileSetup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    country: "",
    address: "",
    annualVolume: "",
    requiredCertifications: [] as string[],
  });

  const handleCertificationToggle = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredCertifications: prev.requiredCertifications.includes(cert)
        ? prev.requiredCertifications.filter((c) => c !== cert)
        : [...prev.requiredCertifications, cert],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create brand record
      const response = await fetch("/api/brands/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: formData.companyName,
          country: formData.country,
          address: formData.address,
          annual_volume: formData.annualVolume,
          required_certifications: JSON.stringify(
            formData.requiredCertifications
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create brand profile");
      }

      // Redirect to brand dashboard
      router.push("/brand/dashboard");
    } catch (error) {
      console.error("Error creating brand profile:", error);
      alert("Failed to create profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-navy to-primary-navy/90 p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-navy">
              Brand Profile Setup
            </h1>
            <p className="mt-2 text-gray-600">
              Tell us about your brand and compliance needs
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
                placeholder="Your Brand Name"
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
                placeholder="e.g., United States, United Kingdom, Germany"
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

            {/* Annual Volume */}
            <div>
              <label
                htmlFor="annualVolume"
                className="block text-sm font-medium text-gray-700"
              >
                Annual Purchasing Volume
              </label>
              <select
                id="annualVolume"
                value={formData.annualVolume}
                onChange={(e) =>
                  setFormData({ ...formData, annualVolume: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#3BCEAC] focus:outline-none focus:ring-[#3BCEAC]"
              >
                <option value="">Select volume range</option>
                <option value="< $100K">Less than $100K</option>
                <option value="$100K - $500K">$100K - $500K</option>
                <option value="$500K - $1M">$500K - $1M</option>
                <option value="$1M - $5M">$1M - $5M</option>
                <option value="$5M+">$5M+</option>
              </select>
            </div>

            {/* Required Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Certifications
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select the certifications you typically require from suppliers
              </p>
              <div className="space-y-2">
                {CERTIFICATION_TYPES.map((cert) => (
                  <label
                    key={cert}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.requiredCertifications.includes(cert)}
                      onChange={() => handleCertificationToggle(cert)}
                      className="h-4 w-4 rounded border-gray-300 text-[#3BCEAC] focus:ring-[#3BCEAC]"
                    />
                    <span className="text-sm text-gray-700">{cert}</span>
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
