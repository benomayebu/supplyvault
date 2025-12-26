import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/auth";
import { getSuppliersWithStats, getSupplierCountries } from "@/lib/suppliers";
import { SuppliersPageClient } from "@/components/suppliers/suppliers-page-client";
import { SupplierType } from "@prisma/client";

interface SuppliersPageProps {
  searchParams: {
    search?: string;
    country?: string;
    types?: string;
    page?: string;
    sortBy?: "name" | "country" | "created_at";
    sortOrder?: "asc" | "desc";
  };
}

export const revalidate = 60; // Cache for 1 minute (ISR)
export const dynamic = "force-dynamic"; // Allow dynamic rendering when needed

export default async function SuppliersPage({
  searchParams,
}: SuppliersPageProps) {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  // Parse filters from search params
  const search = searchParams.search || "";
  const country = searchParams.country || "";
  const supplierTypes = searchParams.types
    ? (searchParams.types.split(",") as SupplierType[])
    : [];
  const page = parseInt(searchParams.page || "1", 10);
  const sortBy = searchParams.sortBy || "created_at";
  const sortOrder = searchParams.sortOrder || "desc";
  const perPage = 20;
  const skip = (page - 1) * perPage;

  // Fetch data
  const [suppliers, countries] = await Promise.all([
    getSuppliersWithStats(brand.id, {
      search,
      country,
      supplierTypes,
      skip,
      take: perPage,
      sortBy,
      sortOrder,
    }),
    getSupplierCountries(brand.id),
  ]);

  return (
    <SuppliersPageClient
      initialSuppliers={suppliers}
      countries={countries}
      initialSearch={search}
      initialCountry={country}
      initialSupplierTypes={supplierTypes}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
      brandId={brand.id}
    />
  );
}
