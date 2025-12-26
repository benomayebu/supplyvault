import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/auth";
import { getCertificationById } from "@/lib/db";
import { CertificationDetailClient } from "@/components/certifications/certification-detail-client";

interface CertificationPageProps {
  params: {
    id: string;
  };
}

export default async function CertificationPage({
  params,
}: CertificationPageProps) {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  const certification = await getCertificationById(params.id);

  if (!certification || certification.supplier.brand_id !== brand.id) {
    redirect("/dashboard/certifications");
  }

  // Calculate status
  const now = new Date();
  const expiryDate = new Date(certification.expiry_date);
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let status: "VALID" | "EXPIRING_SOON" | "EXPIRED" = "VALID";
  if (certification.status === "EXPIRED" || daysUntilExpiry < 0) {
    status = "EXPIRED";
  } else if (daysUntilExpiry <= 60) {
    status = "EXPIRING_SOON";
  }

  return (
    <CertificationDetailClient
      certification={{
        ...certification,
        status,
      }}
    />
  );
}
