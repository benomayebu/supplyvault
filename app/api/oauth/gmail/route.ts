import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple Gmail OAuth start/callback handler.
 *
 * GET /api/oauth/gmail
 *   - redirects to Google consent when no `code` query param
 *   - exchanges `code` for tokens when `code` is present and returns tokens as JSON
 *
 * IMPORTANT: In production store tokens encrypted (KMS) and never return refresh tokens in responses.
 * Environment variables required:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - OAUTH_REDIRECT_URI  (must match the redirect URI configured in Google Cloud Console)
 */

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || undefined; // optional

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { success: false, error: "OAuth not configured (missing env vars)" },
        { status: 500 }
      );
    }

    if (!code) {
      // Start OAuth flow
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: [
          "https://www.googleapis.com/auth/gmail.readonly",
          "openid",
          "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
        access_type: "offline",
        prompt: "consent",
      });

      if (state) params.set("state", state);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return NextResponse.redirect(authUrl);
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(
        { success: false, error: tokenJson },
        { status: 400 }
      );
    }

    // Persist tokens securely using Prisma (encrypted) and return a safe success response.
    try {
      const { saveGmailAccount } = await import("@/lib/gmail-account");

      // Fetch user info to get email address
      const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        }
      );
      const userJson = await userRes.json();

      // In production, map `state` to a brand id and persist accordingly. Here `state` can be brandId.
      const brandId = state || "";

      await saveGmailAccount({
        brandId,
        email: userJson.email || "",
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        scope: tokenJson.scope,
        tokenType: tokenJson.token_type,
        expiresAt: tokenJson.expires_in
          ? new Date(Date.now() + tokenJson.expires_in * 1000)
          : null,
      });

      return NextResponse.json({
        success: true,
        message: "OAuth tokens saved server-side",
        state,
      });
    } catch (err) {
      console.error("Error saving OAuth tokens", err);
      return NextResponse.json(
        { success: false, error: "Failed to persist tokens" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Gmail OAuth route error", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
