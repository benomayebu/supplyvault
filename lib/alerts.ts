import { prisma } from "./db";
import { AlertType, CertificationStatus } from "@prisma/client";

/**
 * Check if an alert already exists for a certification and alert type
 */
export async function alertExists(
  certificationId: string,
  alertType: AlertType
): Promise<boolean> {
  try {
    const existing = await prisma.alert.findFirst({
      where: {
        certification_id: certificationId,
        alert_type: alertType,
      },
    });

    return !!existing;
  } catch (error) {
    console.error("Error checking alert existence:", error);
    return false;
  }
}

/**
 * Get certifications expiring in a specific number of days
 */
export async function getCertificationsExpiringInDays(
  brandId: string,
  days: number
) {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return await prisma.certification.findMany({
      where: {
        supplier: {
          brand_id: brandId,
        },
        expiry_date: {
          gte: targetDate,
          lt: nextDay,
        },
        status: {
          not: CertificationStatus.EXPIRED,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            brand_id: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching expiring certifications:", error);
    throw new Error("Failed to fetch expiring certifications");
  }
}

/**
 * Get certifications that expired today
 */
export async function getExpiredCertificationsToday(brandId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.certification.findMany({
      where: {
        supplier: {
          brand_id: brandId,
        },
        expiry_date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            brand_id: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching expired certifications:", error);
    throw new Error("Failed to fetch expired certifications");
  }
}

/**
 * Create alert for certification expiry
 */
export async function createExpiryAlert(
  certificationId: string,
  brandId: string,
  alertType: AlertType
): Promise<{ id: string } | null> {
  try {
    // Check if alert already exists
    const exists = await alertExists(certificationId, alertType);
    if (exists) {
      console.log(
        `Alert ${alertType} already exists for certification ${certificationId}`
      );
      return null;
    }

    const alert = await prisma.alert.create({
      data: {
        certification_id: certificationId,
        brand_id: brandId,
        alert_type: alertType,
        sent_at: new Date(),
      },
      select: {
        id: true,
      },
    });

    return alert;
  } catch (error) {
    console.error("Error creating expiry alert:", error);
    throw new Error("Failed to create expiry alert");
  }
}
