import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBrand } from '@/lib/auth';
import { getAuthUrl } from '@/lib/gmail';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/gmail
 * Initiate Gmail OAuth flow
 */
export async function GET(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate OAuth URL with brand ID as state
    const authUrl = getAuthUrl(brand.id);

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('Error initiating Gmail OAuth:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
