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

import {
  listAccountsToPoll as listAccountsToPollFromDb,
  persistRefreshedTokens as persistRefreshedTokensDb,
} from "@/lib/gmail-account";

interface GmailTokens {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface GmailAccount {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
  client_id?: string;
  client_secret?: string;
}

async function listAccountsToPoll(): Promise<GmailAccount[]> {
  return await listAccountsToPollFromDb();
}

async function persistRefreshedTokens(
  accountId: string,
  tokens: GmailTokens
): Promise<void> {
  await persistRefreshedTokensDb(accountId, tokens);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accountId } = body as { accountId?: string };

    const accounts = accountId
      ? (await listAccountsToPoll()).filter((a) => a.id === accountId)
      : await listAccountsToPoll();

    for (const acct of accounts) {
      try {
        let accessToken = acct.access_token;
        let refreshToken = acct.refresh_token;

        // If refresh token present and access likely expired, refresh
        if (
          refreshToken &&
          !accessToken &&
          acct.client_id &&
          acct.client_secret
        ) {
          const refreshed = await refreshAccessToken(
            refreshToken,
            acct.client_id,
            acct.client_secret
          );
          accessToken = refreshed.access_token || accessToken;
          refreshToken = refreshed.refresh_token || refreshToken;
          await persistRefreshedTokens(acct.id, refreshed);
        }

        if (!accessToken) {
          console.warn("Skipping account", acct.id, "- no access token");
          continue;
        }

        await processAccount(
          {
            access_token: accessToken,
            refresh_token: refreshToken || undefined,
          },
          { uploadWebhookUrl: "/api/upload-email" }
        );
      } catch (err) {
        console.error("Error polling account", acct.id, err);
      }
    }

    return NextResponse.json({ success: true, processed: accounts.length });
  } catch (err) {
    console.error("gmail-poll worker error", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
