import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { generateDownloadUrl } from "@/lib/s3";

export async function GET(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Generate signed URL for document viewing
    const signedUrl = await generateDownloadUrl(url);

    // Determine file type
    const isPdf = url.toLowerCase().endsWith(".pdf");
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url.toLowerCase());

    return NextResponse.json({
      signedUrl,
      isPdf,
      isImage,
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
