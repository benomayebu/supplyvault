import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { generateUploadUrl, validateFile } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "File name and type are required" },
        { status: 400 }
      );
    }

    // Validate file (create a mock file for validation)
    const mockFile = new File([], fileName, { type: fileType });
    Object.defineProperty(mockFile, "size", {
      value: fileSize || 0,
      writable: false,
    });

    const validation = validateFile(mockFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { signedUrl, key } = await generateUploadUrl(fileName, fileType);

    return NextResponse.json({
      signedUrl,
      key,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
