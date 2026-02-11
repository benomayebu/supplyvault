import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { DocumentViewer } from "@/components/certifications/document-viewer";
import Link from "next/link";

export default async function CertificationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get certification details
  const certification = await prisma.certification.findUnique({
    where: { id: params.id },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          clerk_user_id: true,
        },
      },
    },
  });

  if (!certification) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary-navy py-6 text-white">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Certification Not Found</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">
            The certification you're looking for doesn't exist.
          </p>
          <Link
            href="/supplier/dashboard"
            className="mt-4 inline-block text-[#3BCEAC] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has access (supplier owner)
  if (certification.supplier.clerk_user_id !== userId) {
    redirect("/supplier/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">
            {certification.certification_name}
          </h1>
          <p className="mt-2 text-white/80">Certification Details</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/supplier/dashboard"
            className="inline-flex items-center text-[#3BCEAC] hover:underline"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Certification Info */}
          <div className="rounded-lg bg-white p-6 shadow lg:col-span-1">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Certification Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <br />
                <span className="text-gray-800">
                  {certification.certification_type}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Issuing Body:</span>
                <br />
                <span className="text-gray-800">
                  {certification.issuing_body}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Issue Date:</span>
                <br />
                <span className="text-gray-800">
                  {new Date(certification.issue_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Expiry Date:</span>
                <br />
                <span className="text-gray-800">
                  {new Date(certification.expiry_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <br />
                <span
                  className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                    certification.status === "VALID"
                      ? "bg-green-100 text-green-800"
                      : certification.status === "EXPIRING_SOON"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {certification.status}
                </span>
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Certificate Document
            </h2>
            {certification.document_url ? (
              <DocumentViewer
                documentUrl={certification.document_url}
                fileName={`${certification.certification_name}.pdf`}
              />
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <p className="mt-4 text-sm text-gray-600">
                    No document uploaded for this certification
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
