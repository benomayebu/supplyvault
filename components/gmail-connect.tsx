"use client";

import React from "react";

interface GmailConnectProps {
  state?: string; // optional state (brandId etc.)
  className?: string;
}

export default function GmailConnect({ state, className }: GmailConnectProps) {
  const href = state ? `/api/oauth/gmail?state=${encodeURIComponent(state)}` : `/api/oauth/gmail`;

  return (
    <a href={href} className={className ?? "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"></path></svg>
      Connect Gmail
    </a>
  );
}
