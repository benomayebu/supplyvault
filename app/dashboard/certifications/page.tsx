import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/auth";
import { getAllCertifications } from "@/lib/db";
import { CertificationsPageClient } from "@/components/certifications/certifications-page-client";
import { CertificationStatus } from "@prisma/client";

interface CertificationsPageProps {
  searchParams: {
    search?: string;
    status?: CertificationStatus;
    page?: string;
    sortBy?: "certification_name" | "expiry_date" | "created_at";
    sortOrder?: "asc" | "desc";
  };
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function CertificationsPage({
  searchParams,
}: CertificationsPageProps) {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  const search = searchParams.search || "";
  const status = searchParams.status;
  const page = parseInt(searchParams.page || "1", 10);
  const sortBy = searchParams.sortBy || "expiry_date";
  const sortOrder = searchParams.sortOrder || "asc";
  const perPage = 20;
  const skip = (page - 1) * perPage;

  const { certifications, total, hasMore } = await getAllCertifications(
    brand.id,
    {
      search,
      status,
      skip,
      take: perPage,
      sortBy,
      sortOrder,
    }
  );

  return (
    <CertificationsPageClient
      initialCertifications={certifications}
      total={total}
      hasMore={hasMore}
      initialSearch={search}
      initialStatus={status}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      currentPage={page}
      brandId={brand.id}
    />
  );
}
