import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { CertificationTypeChart } from "@/components/analytics/certification-type-chart";
import { CertificationTrendsChart } from "@/components/analytics/certification-trends-chart";
import { ExpiryStats } from "@/components/analytics/expiry-stats";
import { StatCard } from "@/components/analytics/stat-card";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Building2,
  Shield,
  TrendingUp,
} from "lucide-react";

export default async function BrandAnalytics() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const brand = await prisma.brand.findUnique({
    where: { clerk_user_id: userId },
    include: {
      connections: {
        where: { status: "CONNECTED" },
        include: {
          supplier: {
            include: {
              certifications: true,
            },
          },
        },
      },
    },
  });

  if (!brand) {
    redirect("/onboarding");
  }

  const connectedSuppliers = brand.connections.map((c) => c.supplier);
  const allCertifications = connectedSuppliers.flatMap((s) =>
    s.certifications.map((cert) => ({
      ...cert,
      supplier: { name: s.name },
    }))
  );

  const verifiedSuppliers = connectedSuppliers.filter(
    (s) => s.verification_status === "VERIFIED"
  );

  const totalCertifications = allCertifications.length;
  const averageCertsPerSupplier =
    connectedSuppliers.length > 0
      ? Math.round(totalCertifications / connectedSuppliers.length)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/brand/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Supply Chain Analytics</h1>
              <p className="mt-2 text-white/80">
                Compliance insights across your supplier network
              </p>
            </div>
            <button
              className="hidden items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors sm:flex"
              title="Export feature coming soon"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supplier Network Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Connected Suppliers"
              value={connectedSuppliers.length}
              subtitle="Active connections"
              icon={Building2}
              color="teal"
            />
            <StatCard
              title="Verified Suppliers"
              value={verifiedSuppliers.length}
              subtitle={`${connectedSuppliers.length > 0 ? Math.round((verifiedSuppliers.length / connectedSuppliers.length) * 100) : 0}% of network`}
              icon={Shield}
              color="green"
            />
            <StatCard
              title="Total Certifications"
              value={totalCertifications}
              subtitle="Across all suppliers"
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Avg Per Supplier"
              value={averageCertsPerSupplier}
              subtitle="Certifications per supplier"
              icon={TrendingUp}
              color="gray"
            />
          </div>
        </div>

        {/* Expiry Overview */}
        {allCertifications.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Network-wide Expiry Status
            </h2>
            <ExpiryStats certifications={allCertifications} />
          </div>
        )}

        {/* Charts Grid */}
        {allCertifications.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Certification Trends */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Certification Growth Trends
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                Supplier certification activity over the last 6 months
              </p>
              <CertificationTrendsChart certifications={allCertifications} />
            </div>

            {/* Certification Types */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Certification Coverage
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                Distribution of certification types across your network
              </p>
              <CertificationTypeChart certifications={allCertifications} />
            </div>
          </div>
        )}

        {/* Compliance Overview Card */}
        {connectedSuppliers.length > 0 && (
          <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Network Compliance Score</h2>
                <p className="mt-2 text-white/90">
                  Overall health of your supplier network
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">
                  {Math.min(
                    100,
                    Math.round(
                      (verifiedSuppliers.length / connectedSuppliers.length) *
                        50 +
                        (allCertifications.filter((c) => {
                          const daysUntilExpiry = Math.floor(
                            (new Date(c.expiry_date).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return daysUntilExpiry > 30;
                        }).length /
                          Math.max(allCertifications.length, 1)) *
                          50
                    )
                  )}
                </div>
                <div className="mt-1 text-sm text-white/90">out of 100</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {connectedSuppliers.length}
                </div>
                <div className="text-sm text-white/90">Suppliers</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {verifiedSuppliers.length}
                </div>
                <div className="text-sm text-white/90">Verified</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {allCertifications.length}
                </div>
                <div className="text-sm text-white/90">Certifications</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {
                    new Set(allCertifications.map((c) => c.certification_type))
                      .size
                  }
                </div>
                <div className="text-sm text-white/90">Cert Types</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {connectedSuppliers.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No supplier data yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Connect with suppliers to see analytics and compliance insights
            </p>
            <Link
              href="/brand/suppliers/discover"
              className="mt-6 inline-flex items-center rounded-lg bg-[#3BCEAC] px-6 py-3 font-medium text-white hover:bg-[#3BCEAC]/90 transition-colors"
            >
              Discover Suppliers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
