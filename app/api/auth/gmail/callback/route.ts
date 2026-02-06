import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTokensFromCode } from '@/lib/gmail';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/gmail/callback
 * Handle Gmail OAuth callback and store refresh token
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // brand ID
    const error = searchParams.get('error');

    if (error) {
      console.error('Gmail OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard/settings?gmail_error=${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?gmail_error=missing_params', req.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.refresh_token) {
      throw new Error('No refresh token received. Please revoke access and try again.');
    }

    // Store refresh token in database
    await prisma.brand.update({
      where: { id: state },
      data: {
        gmail_refresh_token: tokens.refresh_token,
        gmail_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        gmail_connected_at: new Date(),
      },
    });

    // Redirect back to settings page with success message
    return NextResponse.redirect(
      new URL('/dashboard/settings?gmail_connected=true', req.url)
    );
  } catch (error) {
    console.error('Error in Gmail OAuth callback:', error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?gmail_error=${encodeURIComponent(error instanceof Error ? error.message : 'oauth_failed')}`,
        req.url
      )
    );
  }
}
