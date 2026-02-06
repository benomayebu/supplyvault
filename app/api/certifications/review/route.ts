import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBrand } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/certifications/review
 * Get all certifications that need manual review
 */
export async function GET(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'pending', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      supplier: {
        brand_id: brand.id,
      },
    };

    if (status === 'pending' || !status) {
      where.needs_review = true;
    }

    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              country: true,
              contact_email: true,
            },
          },
          emailImport: {
            select: {
              id: true,
              sender_email: true,
              sender_name: true,
              received_date: true,
            },
          },
        },
        orderBy: [
          { needs_review: 'desc' }, // Pending reviews first
          { created_at: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.certification.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      certifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certifications/review
 * Approve or reject a certification after manual review
 */
export async function POST(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await auth();
    const body = await req.json();
    const {
      certificationId,
      action, // 'approve' or 'reject'
      notes,
      updatedData, // Optional: corrected certification data
    } = body;

    if (!certificationId || !action) {
      return NextResponse.json(
        { error: 'Certification ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Check if certification belongs to brand
    const certification = await prisma.certification.findFirst({
      where: {
        id: certificationId,
        supplier: {
          brand_id: brand.id,
        },
      },
    });

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      needs_review: false,
      last_verified_at: new Date(),
    };

    if (action === 'approve') {
      updateData.verification_status = 'VERIFIED';
      updateData.verification_method = 'MANUAL';
      updateData.verification_confidence = 1.0;
      updateData.verification_date = new Date();
      updateData.verification_details = {
        reviewedBy: userId,
        reviewedAt: new Date().toISOString(),
        notes: notes || 'Manually approved',
      };

      // Apply any corrected data
      if (updatedData) {
        if (updatedData.certificateNumber) {
          updateData.certificate_number = updatedData.certificateNumber;
        }
        if (updatedData.issuingBody) {
          updateData.issuing_body = updatedData.issuingBody;
        }
        if (updatedData.issueDate) {
          updateData.issue_date = new Date(updatedData.issueDate);
        }
        if (updatedData.expiryDate) {
          updateData.expiry_date = new Date(updatedData.expiryDate);
        }
        if (updatedData.certificationType) {
          updateData.certification_type = updatedData.certificationType;
        }
      }
    } else {
      updateData.verification_status = 'FAILED';
      updateData.verification_method = 'MANUAL';
      updateData.verification_confidence = 0;
      updateData.verification_details = {
        reviewedBy: userId,
        reviewedAt: new Date().toISOString(),
        notes: notes || 'Manually rejected',
      };
    }

    // Update certification
    const updated = await prisma.certification.update({
      where: { id: certificationId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      certification: updated,
    });
  } catch (error) {
    console.error('Error reviewing certification:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
