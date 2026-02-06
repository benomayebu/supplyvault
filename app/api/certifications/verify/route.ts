import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBrand } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { verificationRouter } from '@/lib/verification';
import { CertificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/certifications/verify
 * Manually trigger verification for a specific certification
 */
export async function POST(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { certificationId } = body;

    if (!certificationId) {
      return NextResponse.json(
        { error: 'Certification ID is required' },
        { status: 400 }
      );
    }

    // Get certification
    const certification = await prisma.certification.findFirst({
      where: {
        id: certificationId,
        supplier: {
          brand_id: brand.id,
        },
      },
      include: {
        supplier: true,
      },
    });

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Run verification
    const verificationResult = await verificationRouter.verify(
      certification.certification_type as CertificationType,
      {
        certificateNumber: certification.certificate_number || undefined,
        companyName: certification.supplier.name,
        issuingBody: certification.issuing_body,
        issueDate: certification.issue_date,
        expiryDate: certification.expiry_date,
      }
    );

    // Update certification with verification results
    const updated = await prisma.certification.update({
      where: { id: certificationId },
      data: {
        verification_status: verificationResult.status,
        verification_method: verificationResult.method,
        verification_confidence: verificationResult.confidence,
        verification_date: new Date(),
        verification_details: verificationResult.details as any,
        last_verified_at: new Date(),
        needs_review: !verificationResult.verified && verificationResult.status === 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      certification: updated,
      verificationResult,
    });
  } catch (error) {
    console.error('Error verifying certification:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
