// NOTE: This module is a lightweight Gmail poller. It expects an access token (and optionally refresh token)
// to be supplied by the caller. Token storage / rotation and account listing should be implemented
// in your application DB and secrets storage (KMS). This file focuses on the Gmail REST calls and
// turning attachments into POSTs to the `app/api/upload-email/route.ts` endpoint.

interface TokenSet {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

interface PollOptions {
  query?: string; // Gmail search query. Default: has:attachment
  maxResults?: number;
  uploadWebhookUrl?: string; // app upload route
}

const DEFAULTS: PollOptions = {
  query: "has:attachment",
  maxResults: 50,
  uploadWebhookUrl: "/api/upload-email",
};

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh token: ${err}`);
  }

  return res.json();
}

export async function listMessages(
  accessToken: string,
  query: string,
  maxResults = 100
) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`listMessages failed: ${text}`);
  }
  return res.json(); // { messages: [{id, threadId}], resultSizeEstimate }
}

export async function getMessage(accessToken: string, messageId: string) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`getMessage failed: ${text}`);
  }
  return res.json();
}

export async function getAttachment(
  accessToken: string,
  messageId: string,
  attachmentId: string
) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`getAttachment failed: ${text}`);
  }
  return res.json(); // { data: "base64url..." }
}

function base64UrlToBase64(base64url: string) {
  // Gmail attachments use base64url encoding
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  return base64;
}

export async function processAccount(tokens: TokenSet, options?: PollOptions) {
  const cfg = { ...DEFAULTS, ...(options || {}) };
  const accessToken = tokens.access_token;

  const messagesList = await listMessages(
    accessToken,
    cfg.query!,
    cfg.maxResults
  );
  const messages = messagesList.messages || [];

  for (const m of messages) {
    try {
      const msg = await getMessage(accessToken, m.id);
      const parts = msg.payload?.parts || [];
      const attachments: any[] = [];

      // traverse parts to find attachments
      const stack = Array.isArray(parts) ? [...parts] : [];
      while (stack.length) {
        const p = stack.shift();
        if (!p) continue;
        if (p.filename && p.body && p.body.attachmentId) {
          // fetch attachment
          const att = await getAttachment(
            accessToken,
            msg.id,
            p.body.attachmentId
          );
          const data = base64UrlToBase64(att.data);
          attachments.push({
            fileName: p.filename,
            contentBase64: data,
            contentType: p.mimeType || "application/pdf",
          });
        }
        if (p.parts) stack.push(...p.parts);
      }

      if (attachments.length) {
        // POST to upload webhook
        const payload = {
          messageId: msg.id,
          from: (msg.payload?.headers || []).find((h: any) => h.name === "From")
            ?.value,
          subject: (msg.payload?.headers || []).find(
            (h: any) => h.name === "Subject"
          )?.value,
          attachments,
        } as any;

        // use absolute URL in server env when running from a server worker
        const uploadUrl = cfg.uploadWebhookUrl!.startsWith("/")
          ? `${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000"}${cfg.uploadWebhookUrl}`
          : cfg.uploadWebhookUrl;

        if (uploadUrl) {
          await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }
    } catch (err) {
      console.error("Error processing message", m.id, err);
      // continue with next message
    }
  }
}

export default {
  processAccount,
  listMessages,
  getMessage,
  getAttachment,
  refreshAccessToken,
};
