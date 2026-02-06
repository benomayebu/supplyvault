"use client";

import React, { useEffect, useState } from "react";

export default function GmailCallbackPage() {
  const [status, setStatus] = useState<string>("Processing...");
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    async function finishOAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          setStatus("No code in URL — OAuth did not complete.");
          return;
        }

        setStatus("Exchanging code for tokens...");

        // Call API to exchange code and persist tokens server-side
        const res = await fetch(`/api/oauth/gmail?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || "")}`);
        const json = await res.json();

        if (!res.ok) {
          setStatus("Failed to exchange code");
          setDetail(json);
          return;
        }

        // The server should persist tokens securely. We show a minimal success UI.
        setStatus(json.success ? "Connected — tokens received (server should store them)." : "Server returned error");
        setDetail(json);
      } catch (err) {
        setStatus("OAuth callback error");
        setDetail(err instanceof Error ? err.message : String(err));
      }
    }

    finishOAuth();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Gmail OAuth Callback</h1>
      <p className="mt-4">{status}</p>
      {detail && (
        <pre className="mt-4 bg-gray-50 p-4 rounded text-sm overflow-auto">{JSON.stringify(detail, null, 2)}</pre>
      )}
      <p className="mt-4 text-sm text-gray-600">If this page hangs, ensure your redirect URI matches `OAUTH_REDIRECT_URI` and the server `/api/oauth/gmail` route is reachable.</p>
    </div>
  );
}
