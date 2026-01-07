import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/auth";
import {
  getDashboardMetrics,
  getRecentCertifications,
  getUpcomingExpiries,
} from "@/lib/dashboard";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ExpiryTable } from "@/components/dashboard/expiry-table";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { EmptySuppliers } from "@/components/ui/empty-state";

export const revalidate = 300; // Cache for 5 minutes (ISR)
export const dynamic = "force-dynamic"; // Allow dynamic rendering when needed

async function DashboardContent() {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  // Fetch all dashboard data
  const [metrics, recentActivities, upcomingExpiries] = await Promise.all([
    getDashboardMetrics(brand.id),
    getRecentCertifications(brand.id, 5),
    getUpcomingExpiries(brand.id, 10),
  ]);

  return (
    <>
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Suppliers"
          value={metrics.totalSuppliers}
          href="/dashboard/suppliers"
        />
        <MetricCard
          title="Valid Certifications"
          value={metrics.validCertifications}
          variant="success"
          href="/dashboard/certifications?status=valid"
        />
        <MetricCard
          title="Expiring Soon"
          value={metrics.expiringSoon}
          variant="warning"
          href="/dashboard/alerts"
        />
        <MetricCard
          title="Expired"
          value={metrics.expiredCertifications}
          variant="danger"
          href="/dashboard/certifications?status=expired"
        />
      </div>

      {/* Empty State for No Suppliers */}
      {metrics.totalSuppliers === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <EmptySuppliers />
        </div>
      )}

      {/* Main Content Grid */}
      {metrics.totalSuppliers > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <ActivityFeed activities={recentActivities} />

          {/* Upcoming Expiries */}
          <div className="lg:col-span-2">
            <ExpiryTable expiries={upcomingExpiries} />
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-navy">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your suppliers and certifications
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
