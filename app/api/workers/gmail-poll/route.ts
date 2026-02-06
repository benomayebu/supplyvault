import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { processAccount, refreshAccessToken } from "@/lib/gmail-poller";

/**
 * POST /api/workers/gmail-poll
 * Body: { accountId?: string }
 *
 * This route triggers polling for Gmail attachments for one account or for all accounts.
 * It expects you to implement `listAccountsToPoll()` and `persistRefreshedTokens()` which depend on your DB.
 */

import { listAccountsToPoll as listAccountsToPollFromDb, persistRefreshedTokens as persistRefreshedTokensDb, markLastPolled } from "@/lib/gmail-account";

async function listAccountsToPoll() {
  return await listAccountsToPollFromDb();
}

async function persistRefreshedTokens(accountId: string, tokens: any) {
  return await persistRefreshedTokensDb(accountId, tokens);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accountId } = body as any;

    const accounts = accountId ? (await listAccountsToPoll()).filter((a: any) => a.id === accountId) : await listAccountsToPoll();

    for (const acct of accounts) {
      try {
        let tokens = { access_token: acct.access_token, refresh_token: acct.refresh_token } as any;

        // If refresh token present and access likely expired, refresh (you should check expiry in DB)
        if (acct.refresh_token && !acct.access_token) {
          const refreshed = await refreshAccessToken(acct.refresh_token, acct.client_id, acct.client_secret);
          tokens = { ...tokens, ...refreshed };
          await persistRefreshedTokens(acct.id, refreshed);
        }

        await processAccount(tokens, { uploadWebhookUrl: "/api/upload-email" });
      } catch (err) {
        console.error("Error polling account", acct.id, err);
      }
    }

    return NextResponse.json({ success: true, processed: accounts.length });
  } catch (err) {
    console.error("gmail-poll worker error", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
