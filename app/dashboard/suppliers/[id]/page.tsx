import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/auth";
import { getSupplierById } from "@/lib/db";
import { SupplierDetailClient } from "@/components/suppliers/supplier-detail-client";

interface SupplierPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 60; // Cache for 1 minute

export default async function SupplierPage({ params }: SupplierPageProps) {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  // Fetch supplier with full details
  const supplier = await getSupplierById(params.id);

  if (!supplier || supplier.brand_id !== brand.id) {
    redirect("/dashboard/suppliers");
  }

  // Fetch certifications separately to get all fields
  const { prisma } = await import("@/lib/db");
  const certifications = await prisma.certification.findMany({
    where: {
      supplier_id: params.id,
    },
    orderBy: {
      expiry_date: "asc",
    },
  });

  return (
    <SupplierDetailClient
      supplier={{
        id: supplier.id,
        name: supplier.name,
        country: supplier.country,
        supplier_type: supplier.supplier_type,
        contact_email: supplier.contact_email,
        contact_phone: supplier.contact_phone,
        address: supplier.address,
        verification_status: supplier.verification_status,
        created_at: supplier.created_at,
      }}
      certifications={certifications}
    />
  );
}
