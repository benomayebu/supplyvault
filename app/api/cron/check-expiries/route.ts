import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getCertificationsExpiringInDays,
  getExpiredCertificationsToday,
  createExpiryAlert,
} from "@/lib/alerts";
import { sendExpiryAlertEmail } from "@/lib/email";
import { AlertType } from "@prisma/client";

// Force dynamic rendering for cron job
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Verify cron secret for security (optional - Vercel cron includes auth header)
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret if provided
    const authHeader = req.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      processed: 0,
      alertsCreated: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    // Get all brands
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        email: true,
        company_name: true,
      },
    });

    for (const brand of brands) {
      try {
        // Check 90 days before expiry
        const certs90Days = await getCertificationsExpiringInDays(brand.id, 90);
        for (const cert of certs90Days) {
          try {
            const alert = await createExpiryAlert(
              cert.id,
              brand.id,
              AlertType.NINETY_DAY
            );

            if (alert) {
              results.alertsCreated++;
              const emailResult = await sendExpiryAlertEmail({
                to: brand.email,
                supplierName: cert.supplier.name,
                certificationName: cert.certification_name,
                certificationType: cert.certification_type,
                expiryDate: cert.expiry_date,
                daysUntilExpiry: 90,
                certificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/certifications/${cert.id}`,
              });

              if (emailResult.success) {
                results.emailsSent++;
              } else {
                results.errors.push(
                  `Failed to send email for cert ${cert.id}: ${emailResult.error}`
                );
              }
            }
            results.processed++;
          } catch (error) {
            results.errors.push(
              `Error processing cert ${cert.id} (90 days): ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        // Check 30 days before expiry
        const certs30Days = await getCertificationsExpiringInDays(brand.id, 30);
        for (const cert of certs30Days) {
          try {
            const alert = await createExpiryAlert(
              cert.id,
              brand.id,
              AlertType.THIRTY_DAY
            );

            if (alert) {
              results.alertsCreated++;
              const emailResult = await sendExpiryAlertEmail({
                to: brand.email,
                supplierName: cert.supplier.name,
                certificationName: cert.certification_name,
                certificationType: cert.certification_type,
                expiryDate: new Date(cert.expiry_date),
                daysUntilExpiry: 30,
                certificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/certifications/${cert.id}`,
              });

              if (emailResult.success) {
                results.emailsSent++;
              } else {
                results.errors.push(
                  `Failed to send email for cert ${cert.id}: ${emailResult.error}`
                );
              }
            }
            results.processed++;
          } catch (error) {
            results.errors.push(
              `Error processing cert ${cert.id} (30 days): ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        // Check 7 days before expiry
        const certs7Days = await getCertificationsExpiringInDays(brand.id, 7);
        for (const cert of certs7Days) {
          try {
            const alert = await createExpiryAlert(
              cert.id,
              brand.id,
              AlertType.SEVEN_DAY
            );

            if (alert) {
              results.alertsCreated++;
              const emailResult = await sendExpiryAlertEmail({
                to: brand.email,
                supplierName: cert.supplier.name,
                certificationName: cert.certification_name,
                certificationType: cert.certification_type,
                expiryDate: new Date(cert.expiry_date),
                daysUntilExpiry: 7,
                certificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/certifications/${cert.id}`,
              });

              if (emailResult.success) {
                results.emailsSent++;
              } else {
                results.errors.push(
                  `Failed to send email for cert ${cert.id}: ${emailResult.error}`
                );
              }
            }
            results.processed++;
          } catch (error) {
            results.errors.push(
              `Error processing cert ${cert.id} (7 days): ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        // Check expired today
        const expiredCerts = await getExpiredCertificationsToday(brand.id);
        for (const cert of expiredCerts) {
          try {
            const alert = await createExpiryAlert(
              cert.id,
              brand.id,
              AlertType.EXPIRED
            );

            if (alert) {
              results.alertsCreated++;
              const emailResult = await sendExpiryAlertEmail({
                to: brand.email,
                supplierName: cert.supplier.name,
                certificationName: cert.certification_name,
                certificationType: cert.certification_type,
                expiryDate: new Date(cert.expiry_date),
                daysUntilExpiry: 0,
                certificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/certifications/${cert.id}`,
              });

              if (emailResult.success) {
                results.emailsSent++;
              } else {
                results.errors.push(
                  `Failed to send email for cert ${cert.id}: ${emailResult.error}`
                );
              }

              // Update certification status to EXPIRED
              await prisma.certification.update({
                where: { id: cert.id },
                data: { status: "EXPIRED" },
              });
            }
            results.processed++;
          } catch (error) {
            results.errors.push(
              `Error processing expired cert ${cert.id}: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }
      } catch (error) {
        results.errors.push(
          `Error processing brand ${brand.id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error in check-expiries cron:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
