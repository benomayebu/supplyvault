import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { saveAttachmentToS3, SavedAttachment } from "@/lib/email-ingest";

interface EmailAttachment {
  fileName?: string;
  contentBase64: string;
  contentType?: string;
}

interface EmailBody {
  messageId?: string;
  from?: string;
  subject?: string;
  attachments: EmailAttachment[];
}

interface UploadResult {
  fileName: string;
  success: boolean;
  error?: string;
  saved?: SavedAttachment;
  source?: { messageId?: string; from?: string; subject?: string };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EmailBody;

    const { messageId, from, subject, attachments } = body;

    if (
      !attachments ||
      !Array.isArray(attachments) ||
      attachments.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No attachments provided" },
        { status: 400 }
      );
    }

    const results: UploadResult[] = [];

    for (const att of attachments) {
      const fileName = att.fileName || "attachment.pdf";
      const contentBase64 = att.contentBase64;
      const contentType = att.contentType || "application/pdf";

      if (!contentBase64) {
        results.push({
          fileName,
          success: false,
          error: "missing contentBase64",
        });
        continue;
      }

      try {
        const saved = await saveAttachmentToS3(
          fileName,
          contentBase64,
          contentType
        );
        results.push({
          fileName,
          success: true,
          saved,
          source: { messageId, from, subject },
        });
      } catch (err) {
        console.error("Error saving attachment", err);
        results.push({
          fileName,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("upload-email route error", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
