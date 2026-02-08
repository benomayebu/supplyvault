import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export default async function BrandDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get brand profile
  const brand = await prisma.brand.findUnique({
    where: { clerk_user_id: userId },
    include: {
      suppliers: {
        include: {
          certifications: true,
        },
      },
      connections: {
        where: { status: "CONNECTED" },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              verification_status: true,
            },
          },
        },
      },
    },
  });

  if (!brand) {
    redirect("/onboarding");
  }

  const totalCertifications = brand.suppliers.reduce(
    (sum, supplier) => sum + supplier.certifications.length,
    0
  );

  // Count verified suppliers (from both suppliers and connections)
  const verifiedSuppliersFromList = brand.suppliers.filter(
    (s) => s.verification_status === "VERIFIED"
  ).length;
  const verifiedSuppliersFromConnections = brand.connections.filter(
    (c) => c.supplier.verification_status === "VERIFIED"
  ).length;
  const totalVerifiedSuppliers =
    verifiedSuppliersFromList + verifiedSuppliersFromConnections;

  // Count expiring certifications (within 90 days)
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringCerts = brand.suppliers.flatMap((s) =>
    s.certifications.filter((c) => {
      const expiryDate = new Date(c.expiry_date);
      return expiryDate > now && expiryDate <= ninetyDaysFromNow;
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Welcome, {brand.company_name}</h1>
          <p className="mt-2 text-white/80">Brand Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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

        {/* Recent Activity */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Recent Activity
          </h2>
          {brand.connections.length > 0 || brand.suppliers.length > 0 ? (
            <div className="space-y-3">
              {brand.connections.slice(0, 5).map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                >
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Connected with {connection.supplier.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(connection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
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
                No activity yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Start by discovering and connecting with suppliers
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

        {/* Recent Suppliers */}
        {brand.suppliers.length > 0 && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Your Suppliers
            </h2>
            <div className="space-y-2">
              {brand.suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between border-b border-gray-100 py-3"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {supplier.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {supplier.country}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {supplier.certifications.length} certs
                    </div>
                    <div className="text-xs text-gray-600">
                      {supplier.verification_status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
