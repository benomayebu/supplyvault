import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { CertificationTypeChart } from "@/components/analytics/certification-type-chart";
import { CertificationTrendsChart } from "@/components/analytics/certification-trends-chart";
import { ActivityStats } from "@/components/analytics/activity-stats";
import { ExpiryStats } from "@/components/analytics/expiry-stats";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

export default async function SupplierAnalytics() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supplier = await prisma.supplier.findUnique({
    where: { clerk_user_id: userId },
    include: {
      certifications: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!supplier) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/supplier/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="mt-2 text-white/80">
                Insights into your certifications and compliance
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
        {/* Expiry Overview */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Expiry Overview
          </h2>
          <ExpiryStats certifications={supplier.certifications} />
        </div>

        {/* Activity Stats */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <ActivityStats certifications={supplier.certifications} />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Certification Trends */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Certification Trends
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Track your certification growth over the last 6 months
            </p>
            <CertificationTrendsChart
              certifications={supplier.certifications}
            />
          </div>

          {/* Certification Types */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Certification Types
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Distribution of your certifications by type
            </p>
            <CertificationTypeChart certifications={supplier.certifications} />
          </div>
        </div>

        {/* Compliance Score Card */}
        <div className="rounded-lg bg-gradient-to-br from-[#3BCEAC] to-[#10B981] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Compliance Score</h2>
              <p className="mt-2 text-white/90">
                Based on active certifications and expiry status
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">
                {supplier.certifications.length > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (supplier.certifications.filter((c) => {
                          const daysUntilExpiry = Math.floor(
                            (new Date(c.expiry_date).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return daysUntilExpiry > 30;
                        }).length /
                          supplier.certifications.length) *
                          100
                      )
                    )
                  : 0}
              </div>
              <div className="mt-1 text-sm text-white/90">out of 100</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                {supplier.certifications.length}
              </div>
              <div className="text-sm text-white/90">Total Certs</div>
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                {
                  supplier.certifications.filter((c) => {
                    const daysUntilExpiry = Math.floor(
                      (new Date(c.expiry_date).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiry > 30;
                  }).length
                }
              </div>
              <div className="text-sm text-white/90">Active</div>
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">
                {
                  new Set(
                    supplier.certifications.map((c) => c.certification_type)
                  ).size
                }
              </div>
              <div className="text-sm text-white/90">Types</div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {supplier.certifications.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Download className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No certification data yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload certifications to see detailed analytics and insights
            </p>
            <Link
              href="/supplier/certifications/upload"
              className="mt-6 inline-flex items-center rounded-lg bg-[#3BCEAC] px-6 py-3 font-medium text-white hover:bg-[#3BCEAC]/90 transition-colors"
            >
              Upload Your First Certification
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
