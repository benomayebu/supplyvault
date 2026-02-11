import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ExpiryTimeline } from "@/components/analytics/expiry-timeline";
import { ExpiryStats } from "@/components/analytics/expiry-stats";

export default async function BrandDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get brand profile with connected suppliers (marketplace model only)
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

  // Derive all metrics from connected suppliers only
  const connectedSuppliers = brand.connections.map((c) => c.supplier);

  const totalCertifications = connectedSuppliers.reduce(
    (sum, supplier) => sum + supplier.certifications.length,
    0
  );

  const totalVerifiedSuppliers = connectedSuppliers.filter(
    (s) => s.verification_status === "VERIFIED"
  ).length;

  // Get all certifications from connected suppliers
  const allCertifications = connectedSuppliers.flatMap((s) =>
    s.certifications.map((cert) => ({
      ...cert,
      supplier: { name: s.name },
    }))
  );

  // Count expiring certifications (within 90 days)
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringCerts = allCertifications.filter((c) => {
    const expiryDate = new Date(c.expiry_date);
    return expiryDate > now && expiryDate <= ninetyDaysFromNow;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Welcome, {brand.company_name}</h1>
          <p className="mt-2 text-white/80">Brand Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Expiry Statistics */}
        {allCertifications.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Supplier Certifications Overview
            </h2>
            <ExpiryStats certifications={allCertifications} />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Verified Suppliers Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Verified Suppliers
            </h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3BCEAC]">
                {totalVerifiedSuppliers}
              </div>
              <div className="mt-1 text-sm text-gray-600">Verified</div>
            </div>
          </div>

          {/* Connections Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Your Connections
            </h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3BCEAC]">
                {brand.connections.length}
              </div>
              <div className="mt-1 text-sm text-gray-600">Connected</div>
            </div>
          </div>

          {/* Certifications Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Certifications
            </h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3BCEAC]">
                {totalCertifications}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Total Certifications
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href="/brand/suppliers/discover"
                className="block w-full rounded bg-[#3BCEAC] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#3BCEAC]/90"
              >
                Search Suppliers
              </a>
              {expiringCerts.length > 0 && (
                <a
                  href="/brand/certifications/expiring"
                  className="block w-full rounded border border-yellow-500 bg-yellow-50 px-4 py-2 text-center text-sm font-medium text-yellow-700 hover:bg-yellow-100"
                >
                  View Expiring Certs ({expiringCerts.length})
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Expiry Timeline */}
        {allCertifications.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Upcoming Certificate Expiries
            </h2>
            <ExpiryTimeline
              certifications={allCertifications}
              viewType="brand"
            />
          </div>
        )}

        {/* Connected Suppliers */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Connected Suppliers
          </h2>
          {brand.connections.length > 0 ? (
            <div className="space-y-3">
              {brand.connections.map((connection) => (
                <a
                  key={connection.id}
                  href={`/brand/suppliers/${connection.supplier.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {connection.supplier.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {connection.supplier.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {connection.supplier.certifications.length} certs
                    </div>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${
                        connection.supplier.verification_status === "VERIFIED"
                          ? "bg-green-100 text-green-800"
                          : connection.supplier.verification_status === "BASIC"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {connection.supplier.verification_status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No suppliers connected yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Start by discovering and connecting with verified suppliers
              </p>
              <a
                href="/brand/suppliers/discover"
                className="mt-4 inline-flex items-center rounded-lg bg-[#3BCEAC] px-6 py-3 font-medium text-white hover:bg-[#3BCEAC]/90"
              >
                Discover Suppliers
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
