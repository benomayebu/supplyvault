import { getSupplierById } from "./db";
import { getCurrentBrand } from "./auth";
import { CertificationType, CertificationStatus } from "@prisma/client";

export interface SupplierReportData {
  supplier: {
    id: string;
    name: string;
    country: string;
    supplier_type: string;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    brand: {
      company_name: string;
    };
  };
  certifications: Array<{
    id: string;
    certification_type: CertificationType;
    certification_name: string;
    issuing_body: string;
    issue_date: Date;
    expiry_date: Date;
    status: CertificationStatus;
  }>;
}

/**
 * Get supplier data with all certifications for report generation
 */
export async function getSupplierReportData(
  supplierId: string
): Promise<SupplierReportData | null> {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      throw new Error("Unauthorized");
    }

    const supplier = await getSupplierById(supplierId);

    if (!supplier || supplier.brand_id !== brand.id) {
      return null;
    }

    // Get full certification details (need to fetch separately to get all fields)
    const { prisma } = await import("./db");
    const certifications = await prisma.certification.findMany({
      where: {
        supplier_id: supplierId,
      },
      select: {
        id: true,
        certification_type: true,
        certification_name: true,
        issuing_body: true,
        issue_date: true,
        expiry_date: true,
        status: true,
      },
      orderBy: {
        expiry_date: "asc",
      },
    });

    return {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        country: supplier.country,
        supplier_type: supplier.supplier_type || "OTHER",
        contact_email: supplier.contact_email,
        contact_phone: supplier.contact_phone,
        address: supplier.address || "",
        brand: {
          company_name: supplier.brand?.company_name || "Unknown",
        },
      },
      certifications: certifications.map((cert) => ({
        id: cert.id,
        certification_type: cert.certification_type,
        certification_name: cert.certification_name,
        issuing_body: cert.issuing_body,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        status: cert.status,
      })),
    };
  } catch (error) {
    console.error("Error fetching supplier report data:", error);
    throw error;
  }
}
