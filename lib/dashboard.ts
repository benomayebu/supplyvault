import { prisma } from "./db";
import { CertificationStatus } from "@prisma/client";

/**
 * Get dashboard metrics for a brand
 */
export async function getDashboardMetrics(brandId: string) {
  try {
    // Get total suppliers count
    const totalSuppliers = await prisma.supplier.count({
      where: { brand_id: brandId },
    });

    // Get certifications counts by status - only select needed fields
    const certifications = await prisma.certification.findMany({
      where: {
        supplier: {
          brand_id: brandId,
        },
      },
      select: {
        status: true,
        expiry_date: true,
      },
      // Add take limit to prevent large result sets
      take: 10000, // Reasonable limit for metrics calculation
    });

    const validCount = certifications.filter(
      (c) => c.status === CertificationStatus.VALID
    ).length;

    const expiringSoonCount = certifications.filter((c) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(c.expiry_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return (
        c.status !== CertificationStatus.EXPIRED &&
        daysUntilExpiry > 0 &&
        daysUntilExpiry <= 60
      );
    }).length;

    const expiredCount = certifications.filter(
      (c) => c.status === CertificationStatus.EXPIRED
    ).length;

    return {
      totalSuppliers,
      validCertifications: validCount,
      expiringSoon: expiringSoonCount,
      expiredCertifications: expiredCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw new Error("Failed to fetch dashboard metrics");
  }
}

/**
 * Get recent certifications (last uploaded)
 */
export async function getRecentCertifications(brandId: string, limit = 5) {
  try {
    return await prisma.certification.findMany({
      where: {
        supplier: {
          brand_id: brandId,
        },
      },
      select: {
        id: true,
        certification_type: true,
        certification_name: true,
        created_at: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching recent certifications:", error);
    throw new Error("Failed to fetch recent certifications");
  }
}

/**
 * Get upcoming expiring certifications
 */
export async function getUpcomingExpiries(brandId: string, limit = 10) {
  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 365); // Next year

    return await prisma.certification.findMany({
      where: {
        supplier: {
          brand_id: brandId,
        },
        expiry_date: {
          gte: now,
          lte: futureDate,
        },
        status: {
          not: CertificationStatus.EXPIRED,
        },
      },
      select: {
        id: true,
        certification_type: true,
        certification_name: true,
        expiry_date: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expiry_date: "asc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching upcoming expiries:", error);
    throw new Error("Failed to fetch upcoming expiries");
  }
}
