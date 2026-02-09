"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function OnboardingRoleSelection() {
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<"SUPPLIER" | "BRAND" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // If user already completed onboarding, redirect to their dashboard
  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.unsafeMetadata as {
        stakeholderRole?: string;
        onboardingComplete?: boolean;
      };
      if (metadata?.onboardingComplete && metadata?.stakeholderRole) {
        const dashboard =
          metadata.stakeholderRole === "SUPPLIER"
            ? "/supplier/dashboard"
            : "/brand/dashboard";
        window.location.href = dashboard;
      }
    }
  }, [isLoaded, user]);

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    setIsLoading(true);

    try {
      // Update Clerk user metadata with selected role
      await user.update({
        unsafeMetadata: {
          stakeholderRole: selectedRole,
        },
      });

      // Redirect to role-specific setup
      if (selectedRole === "SUPPLIER") {
        window.location.href = "/onboarding/supplier";
      } else {
        window.location.href = "/onboarding/brand";
      }
    } catch (error) {
      console.error("Error updating user metadata:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-navy to-primary-navy/90 p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary-navy">
              Welcome to SupplyVault
            </h1>
            <p className="mt-2 text-gray-600">Let&apos;s get you set up</p>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-center text-xl font-semibold text-gray-800">
              I am a...
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Supplier Card */}
              <button
                onClick={() => setSelectedRole("SUPPLIER")}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  selectedRole === "SUPPLIER"
                    ? "border-[#3BCEAC] bg-[#3BCEAC]/5"
                    : "border-gray-200 hover:border-[#3BCEAC]/50"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-primary-navy">
                    Supplier
                  </h3>
                  {selectedRole === "SUPPLIER" && (
                    <svg
                      className="h-6 w-6 text-[#3BCEAC]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  I manufacture textiles, garments, or other products
                </p>
                <div className="mt-4 rounded bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-700">
                    You will be able to:
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-gray-600">
                    <li>• Upload your certifications</li>
                    <li>• Manage your product catalog</li>
                    <li>• Connect with brands</li>
                  </ul>
                </div>
              </button>

              {/* Brand Card */}
              <button
                onClick={() => setSelectedRole("BRAND")}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  selectedRole === "BRAND"
                    ? "border-[#3BCEAC] bg-[#3BCEAC]/5"
                    : "border-gray-200 hover:border-[#3BCEAC]/50"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-primary-navy">Brand</h3>
                  {selectedRole === "BRAND" && (
                    <svg
                      className="h-6 w-6 text-[#3BCEAC]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  I buy from suppliers and need to track compliance
                </p>
                <div className="mt-4 rounded bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-700">
                    You will be able to:
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-gray-600">
                    <li>• Discover verified suppliers</li>
                    <li>• Track supplier certifications</li>
                    <li>• Manage compliance requirements</li>
                  </ul>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
              className={`rounded-lg px-8 py-3 text-lg font-semibold transition-colors ${
                selectedRole && !isLoading
                  ? "bg-[#3BCEAC] text-white hover:bg-[#3BCEAC]/90"
                  : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
