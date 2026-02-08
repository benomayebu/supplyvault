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
    },
  });

  if (!brand) {
    redirect("/onboarding");
  }

  const totalCertifications = brand.suppliers.reduce(
    (sum, supplier) => sum + supplier.certifications.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Brand Dashboard</h1>
          <p className="mt-2 text-white/80">{brand.company_name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Suppliers Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Suppliers
            </h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3BCEAC]">
                {brand.suppliers.length}
              </div>
              <div className="mt-1 text-sm text-gray-600">Total Suppliers</div>
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
              <button className="w-full rounded bg-[#3BCEAC] px-4 py-2 text-sm font-medium text-white hover:bg-[#3BCEAC]/90">
                Find Suppliers
              </button>
              <button className="w-full rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Add Supplier
              </button>
            </div>
          </div>
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
