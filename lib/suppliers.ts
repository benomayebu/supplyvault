import { prisma } from "./db";
import {
  SupplierType,
  CertificationStatus,
  VerificationStatus,
} from "@prisma/client";

export interface SupplierWithCertCount {
  id: string;
  name: string;
  country: string;
  supplier_type: SupplierType;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  verification_status: VerificationStatus;
  created_at: Date;
  updated_at: Date;
  certCount: number;
  status: "valid" | "expiring" | "expired";
}

/**
 * Get suppliers with certification counts and status
 */
export async function getSuppliersWithStats(
  brandId: string,
  options?: {
    search?: string;
    country?: string;
    supplierTypes?: SupplierType[];
    skip?: number;
    take?: number;
    sortBy?: "name" | "country" | "created_at";
    sortOrder?: "asc" | "desc";
  }
) {
  try {
    const where: {
      brand_id: string;
      name?: { contains: string; mode: "insensitive" };
      country?: string;
      supplier_type?: { in: SupplierType[] };
    } = {
      brand_id: brandId,
    };

    if (options?.search) {
      where.name = {
        contains: options.search,
        mode: "insensitive",
      };
    }

    if (options?.country) {
      where.country = options.country;
    }

    if (options?.supplierTypes && options.supplierTypes.length > 0) {
      where.supplier_type = {
        in: options.supplierTypes,
      };
    }

    const orderBy: Record<string, "asc" | "desc"> = {};
    if (options?.sortBy) {
      orderBy[options.sortBy] = options.sortOrder || "asc";
    } else {
      orderBy.created_at = "desc";
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      select: {
        id: true,
        name: true,
        country: true,
        supplier_type: true,
        contact_email: true,
        contact_phone: true,
        address: true,
        verification_status: true,
        created_at: true,
        updated_at: true,
        certifications: {
          select: {
            status: true,
            expiry_date: true,
          },
        },
      },
      orderBy,
      skip: options?.skip,
      take: options?.take ?? 20,
    });

    // Calculate status and cert count for each supplier
    const suppliersWithStats: SupplierWithCertCount[] = suppliers.map(
      (supplier) => {
        const certs = supplier.certifications;
        const certCount = certs.length;

        // Determine status based on certifications
        let status: "valid" | "expiring" | "expired" = "valid";
        if (certCount > 0) {
          const now = new Date();
          const hasExpired = certs.some(
            (c) => c.status === CertificationStatus.EXPIRED
          );
          const hasExpiring = certs.some((c) => {
            if (c.status === CertificationStatus.EXPIRED) return false;
            const daysUntilExpiry = Math.ceil(
              (new Date(c.expiry_date).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry <= 60 && daysUntilExpiry > 0;
          });

          if (hasExpired) {
            status = "expired";
          } else if (hasExpiring) {
            status = "expiring";
          }
        }

        return {
          id: supplier.id,
          name: supplier.name,
          country: supplier.country,
          supplier_type: supplier.supplier_type,
          contact_email: supplier.contact_email,
          contact_phone: supplier.contact_phone,
          address: supplier.address,
          verification_status: supplier.verification_status,
          created_at: supplier.created_at,
          updated_at: supplier.updated_at,
          certCount,
          status,
        };
      }
    );

    return suppliersWithStats;
  } catch (error) {
    console.error("Error fetching suppliers with stats:", error);
    throw new Error("Failed to fetch suppliers");
  }
}

/**
 * Get unique countries for filter dropdown
 */
export async function getSupplierCountries(brandId: string) {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { brand_id: brandId },
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    });

    return suppliers.map((s) => s.country);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}
