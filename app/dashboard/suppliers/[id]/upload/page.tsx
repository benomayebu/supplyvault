import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/auth";
import { getSupplierById } from "@/lib/db";
import { UploadPageClient } from "@/components/certifications/upload-page-client";

interface UploadPageProps {
  params: {
    id: string;
  };
}

export default async function UploadPage({ params }: UploadPageProps) {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  // Verify supplier belongs to brand
  const supplier = await getSupplierById(params.id);
  if (!supplier || supplier.brand_id !== brand.id) {
    redirect("/dashboard/suppliers");
  }

  return (
    <UploadPageClient supplierId={params.id} supplierName={supplier.name} />
  );
}
