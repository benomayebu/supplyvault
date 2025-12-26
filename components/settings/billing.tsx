"use client";

import { useState } from "react";
import { ArrowUpCircle, FileText, TrendingUp } from "lucide-react";
import { SubscriptionTier } from "@prisma/client";
import Link from "next/link";

interface BillingProps {
  subscriptionTier: SubscriptionTier;
  usageMetrics: {
    supplierCount: number;
    certificationCount: number;
  };
}

const subscriptionTierLabels: Record<SubscriptionTier, string> = {
  FREE: "Free",
  BASIC: "Basic",
  PREMIUM: "Premium",
};

const subscriptionLimits: Record<
  SubscriptionTier,
  { suppliers: number | null; certifications: number | null }
> = {
  FREE: { suppliers: 10, certifications: 50 },
  BASIC: { suppliers: 100, certifications: 500 },
  PREMIUM: { suppliers: null, certifications: null },
};

export function Billing({ subscriptionTier, usageMetrics }: BillingProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = () => {
    // TODO: Implement upgrade flow (e.g., Stripe integration)
    setIsUpgrading(true);
    alert("Upgrade functionality will be implemented with payment integration");
    setIsUpgrading(false);
  };

  const limits = subscriptionLimits[subscriptionTier];
  const supplierUsagePercent =
    limits.suppliers !== null
      ? Math.min((usageMetrics.supplierCount / limits.suppliers) * 100, 100)
      : 0;
  const certUsagePercent =
    limits.certifications !== null
      ? Math.min(
          (usageMetrics.certificationCount / limits.certifications) * 100,
          100
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-navy">
          Billing & Usage
        </h2>
        <p className="mt-1 text-gray-600">
          Manage your subscription and view usage metrics
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary-navy">
              Current Plan
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              You are currently on the{" "}
              <span className="font-semibold">
                {subscriptionTierLabels[subscriptionTier]}
              </span>{" "}
              plan
            </p>
          </div>
          {subscriptionTier !== SubscriptionTier.PREMIUM && (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary-teal px-4 py-2 text-sm font-medium text-white hover:bg-secondary-teal/90 disabled:opacity-50"
            >
              <ArrowUpCircle className="h-4 w-4" />
              {isUpgrading ? "Processing..." : "Upgrade Plan"}
            </button>
          )}
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary-navy" />
          <h3 className="text-lg font-semibold text-primary-navy">
            Usage Metrics
          </h3>
        </div>

        <div className="space-y-6">
          {/* Suppliers Usage */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Suppliers
              </span>
              <span className="text-sm text-gray-600">
                {usageMetrics.supplierCount}
                {limits.suppliers !== null && ` / ${limits.suppliers}`}
              </span>
            </div>
            {limits.suppliers !== null ? (
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-secondary-teal transition-all"
                  style={{ width: `${supplierUsagePercent}%` }}
                />
              </div>
            ) : (
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-secondary-teal"
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>

          {/* Certifications Usage */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Certifications
              </span>
              <span className="text-sm text-gray-600">
                {usageMetrics.certificationCount}
                {limits.certifications !== null &&
                  ` / ${limits.certifications}`}
              </span>
            </div>
            {limits.certifications !== null ? (
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-secondary-teal transition-all"
                  style={{ width: `${certUsagePercent}%` }}
                />
              </div>
            ) : (
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-secondary-teal"
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>
        </div>

        {subscriptionTier === SubscriptionTier.FREE &&
          (supplierUsagePercent >= 80 || certUsagePercent >= 80) && (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                You&apos;re approaching your plan limits. Consider upgrading to
                continue adding suppliers and certifications.
              </p>
            </div>
          )}
      </div>

      {/* Invoices */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary-navy" />
            <div>
              <h3 className="text-lg font-semibold text-primary-navy">
                Invoices
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                View and download your billing history
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/settings/invoices"
            className="text-sm font-medium text-secondary-teal hover:text-secondary-teal/80"
          >
            View All Invoices →
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Invoice history will be available after setting up payment
          integration.
        </p>
      </div>
    </div>
  );
}
