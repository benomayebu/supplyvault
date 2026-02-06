import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { saveAttachmentToS3 } from "@/lib/email-ingest";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Expecting { messageId?: string, from?: string, subject?: string, attachments: [{ fileName, contentBase64, contentType }] }
    const { messageId, from, subject, attachments } = body as any;

    if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
      return NextResponse.json({ success: false, error: "No attachments provided" }, { status: 400 });
    }

    const results: any[] = [];

    for (const att of attachments) {
      const fileName = att.fileName || "attachment.pdf";
      const contentBase64 = att.contentBase64;
      const contentType = att.contentType || "application/pdf";

      if (!contentBase64) {
        results.push({ fileName, success: false, error: "missing contentBase64" });
        continue;
      }

      try {
        const saved = await saveAttachmentToS3(fileName, contentBase64, contentType);
        results.push({ fileName, success: true, saved, source: { messageId, from, subject } });
      } catch (err) {
        console.error("Error saving attachment", err);
        results.push({ fileName, success: false, error: err instanceof Error ? err.message : String(err) });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("upload-email route error", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
