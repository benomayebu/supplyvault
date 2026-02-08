import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export default async function SupplierDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get supplier profile
  const supplier = await prisma.supplier.findUnique({
    where: { clerk_user_id: userId },
    include: {
      certifications: {
        orderBy: { created_at: "desc" },
        take: 5,
      },
    },
  });

  if (!supplier) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Supplier Dashboard</h1>
          <p className="mt-2 text-white/80">{supplier.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Profile
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Country:</span>{" "}
                <span className="text-gray-800">{supplier.country}</span>
              </div>
              {supplier.supplier_type && (
                <div>
                  <span className="font-medium text-gray-600">Type:</span>{" "}
                  <span className="text-gray-800">
                    {supplier.supplier_type}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Status:</span>{" "}
                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  {supplier.verification_status}
                </span>
              </div>
            </div>
          </div>

          {/* Certifications Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Certifications
            </h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3BCEAC]">
                {supplier.certifications.length}
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
                Upload Certification
              </button>
              <button className="w-full rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Recent Certifications */}
        {supplier.certifications.length > 0 && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Recent Certifications
            </h2>
            <div className="space-y-2">
              {supplier.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between border-b border-gray-100 py-2"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {cert.certification_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {cert.certification_type}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Expires: {new Date(cert.expiry_date).toLocaleDateString()}
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
