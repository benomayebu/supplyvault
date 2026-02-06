import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verificationRouter } from '@/lib/verification';
import { sendExpiryAlertEmail } from '@/lib/email';
import { CertificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/re-verify
 * Monthly re-verification of all VERIFIED certificates
 * Checks if certificates have been revoked or are no longer valid
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret if provided
    const authHeader = req.headers.get('authorization');
    if (CRON_SECRET && authHeader !== \`Bearer \${CRON_SECRET}\`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      processed: 0,
      reverified: 0,
      revoked: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get all VERIFIED certifications that haven't been re-verified in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const certifications = await prisma.certification.findMany({
      where: {
        verification_status: 'VERIFIED',
        OR: [
          { last_verified_at: null },
          { last_verified_at: { lt: thirtyDaysAgo } },
        ],
      },
      include: {
        supplier: {
          include: {
            brand: true,
          },
        },
      },
      take: 100, // Process in batches to avoid timeout
    });

    for (const cert of certifications) {
      try {
        // Run verification
        const verificationResult = await verificationRouter.verify(
          cert.certification_type as CertificationType,
          {
            certificateNumber: cert.certificate_number || undefined,
            companyName: cert.supplier.name,
            issuingBody: cert.issuing_body,
            issueDate: cert.issue_date,
            expiryDate: cert.expiry_date,
          }
        );

        // Check if certificate is no longer verified (revoked)
        const wasRevoked = verificationResult.status === 'FAILED' || 
                          verificationResult.status === 'PENDING';

        // Update certification
        await prisma.certification.update({
          where: { id: cert.id },
          data: {
            verification_status: verificationResult.status,
            verification_method: verificationResult.method,
            verification_confidence: verificationResult.confidence,
            verification_details: verificationResult.details as any,
            last_verified_at: new Date(),
            needs_review: wasRevoked,
          },
        });

        if (wasRevoked) {
          results.revoked++;

          // Send alert to brand about revoked certificate
          try {
            await sendExpiryAlertEmail({
              to: cert.supplier.brand.email,
              supplierName: cert.supplier.name,
              certificationName: cert.certification_name,
              certificationType: cert.certification_type,
              expiryDate: cert.expiry_date,
              daysUntilExpiry: -1, // Special value to indicate revoked
              certificationUrl: \`\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/certifications/\${cert.id}\`,
            });
          } catch (emailError) {
            console.error('Error sending revocation email:', emailError);
            results.errors.push(
              \`Failed to send revocation email for cert \${cert.id}\`
            );
          }
        } else {
          results.reverified++;
        }

        results.processed++;
      } catch (error) {
        console.error(\`Error re-verifying certification \${cert.id}:\`, error);
        results.errors.push(
          \`Failed to re-verify cert \${cert.id}: \${error instanceof Error ? error.message : 'Unknown error'}\`
        );
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error in re-verification cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
