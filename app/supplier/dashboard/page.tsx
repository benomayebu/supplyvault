import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ExpiryTimeline } from "@/components/analytics/expiry-timeline";
import { ExpiryStats } from "@/components/analytics/expiry-stats";

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

  // Check profile completeness
  const isProfileComplete =
    supplier.supplier_type &&
    supplier.contact_email &&
    supplier.manufacturing_capabilities;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Welcome, {supplier.name}</h1>
          <p className="mt-2 text-white/80">Supplier Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Status Alert */}
        {!isProfileComplete && (
          <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Profile Status: ⚠️ Incomplete
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Complete your profile to improve visibility and attract more
                    brands.
                  </p>
                  {supplier.certifications.length === 0 && (
                    <p className="mt-1">
                      → Add your first certification to get started
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expiry Statistics */}
        {supplier.certifications.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Certification Overview
            </h2>
            <ExpiryStats certifications={supplier.certifications} />
          </div>
        )}

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
              <a
                href="/supplier/analytics"
                className="block w-full rounded bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                View Analytics
              </a>
              <a
                href="/supplier/certifications/upload"
                className="block w-full rounded bg-[#3BCEAC] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#3BCEAC]/90"
              >
                Upload Certification
              </a>
              <a
                href="/supplier/profile/edit"
                className="block w-full rounded border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit Profile
              </a>
            </div>
          </div>
        </div>

        {/* Expiry Timeline */}
        {supplier.certifications.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Upcoming Expiries
            </h2>
            <ExpiryTimeline
              certifications={supplier.certifications}
              viewType="supplier"
            />
          </div>
        )}

        {/* Recent Certifications */}
        {supplier.certifications.length > 0 ? (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Recent Certifications
            </h2>
            <div className="space-y-2">
              {supplier.certifications.map((cert) => (
                <a
                  key={cert.id}
                  href={`/supplier/certifications/${cert.id}`}
                  className="flex items-center justify-between border-b border-gray-100 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-800">
                        {cert.certification_name}
                      </div>
                      {cert.document_url && (
                        <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Document
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {cert.certification_type}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">
                      Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No certifications yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload your first certification to showcase your compliance
            </p>
            <a
              href="/supplier/certifications/upload"
              className="mt-6 inline-flex items-center rounded-lg bg-[#3BCEAC] px-6 py-3 font-medium text-white hover:bg-[#3BCEAC]/90"
            >
              Upload Certification
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
