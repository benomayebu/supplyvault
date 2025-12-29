"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Select } from "@/lib/form-validation";
import { Loader2 } from "lucide-react";

interface OnboardingFormProps {
  userEmail: string;
  initialCompanyName?: string;
}

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

export function OnboardingForm({
  userEmail,
  initialCompanyName = "",
}: OnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [country, setCountry] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          country: country || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete onboarding");
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800" role="alert">{error}</p>
        </div>
      )}

      {/* Company Name */}
      <FormField
        label="Company Name"
        htmlFor="companyName"
        required
        error={companyName.trim() === "" && isSubmitting ? "Company name is required" : undefined}
      >
        <Input
          id="companyName"
          type="text"
          placeholder="e.g., Acme Fashion Co."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          disabled={isSubmitting}
          error={companyName.trim() === "" && isSubmitting}
          autoFocus
        />
      </FormField>

      {/* Country */}
      <FormField
        label="Country"
        htmlFor="country"
        helpText="Optional - You can add this later in Settings"
      >
        <Select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Select a country</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </FormField>

      {/* Email (Read-only) */}
      <FormField
        label="Email"
        htmlFor="email"
        helpText="We'll use this for important notifications about your supply chain"
      >
        <Input
          id="email"
          type="email"
          value={userEmail}
          disabled
          className="bg-gray-50 cursor-not-allowed"
        />
      </FormField>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !companyName.trim()}
          className="rounded-lg bg-primary-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up your account...
            </span>
          ) : (
            "Complete Setup"
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 pt-2">
        You can add more details later in Settings
      </p>
    </form>
  );
}

