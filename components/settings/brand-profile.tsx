"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { SubscriptionTier } from "@prisma/client";

interface BrandProfileProps {
  initialBrand: {
    id: string;
    company_name: string;
    email: string;
    country: string | null;
    subscription_tier: SubscriptionTier;
  };
}

const subscriptionTierLabels: Record<SubscriptionTier, string> = {
  FREE: "Free",
  BASIC: "Basic",
  PREMIUM: "Premium",
};

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Portugal",
  "Ireland",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "South Africa",
  "United Arab Emirates",
  "Israel",
  "Turkey",
  "Other",
];

export function BrandProfile({ initialBrand }: BrandProfileProps) {
  const [companyName, setCompanyName] = useState(initialBrand.company_name);
  const [country, setCountry] = useState(initialBrand.country || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanges =
    companyName !== initialBrand.company_name ||
    country !== (initialBrand.country || "");

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          country: country || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save changes");
      }

      setSuccess(true);
      // Optionally refresh the page or update parent state
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-navy">Brand Profile</h2>
        <p className="mt-1 text-gray-600">
          Manage your company information and settings
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Brand profile updated successfully!
          </p>
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label
            htmlFor="company_name"
            className="block text-sm font-medium text-gray-700"
          >
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="company_name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={initialBrand.email}
            disabled
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed. Update it in your Clerk account settings.
          </p>
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
          >
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subscription Tier
          </label>
          <div className="mt-1">
            <span className="inline-flex rounded-full bg-primary-navy px-3 py-1 text-sm font-semibold text-white">
              {subscriptionTierLabels[initialBrand.subscription_tier]}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upgrade your plan in the Billing tab.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
