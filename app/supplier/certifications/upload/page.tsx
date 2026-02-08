import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getStakeholderRole } from "@/lib/auth";
import UploadCertificateClient from "@/components/certifications/upload-certificate-client";

export default async function UploadCertificatePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify user is a supplier
  const role = await getStakeholderRole();
  if (role !== "SUPPLIER") {
    redirect("/brand/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Upload Certification</h1>
          <p className="mt-2 text-white/80">
            Add a new certification to your profile
          </p>
        </div>
      </div>

      <UploadCertificateClient />
    </div>
  );
}
