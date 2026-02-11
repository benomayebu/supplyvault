import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parsePDF, cleanExtractedText } from "@/lib/ai/pdf-parser";
import { extractCertificateData } from "@/lib/ai/certificate-extractor";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "AI parsing is not configured. Please contact support or enter data manually.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error:
            "Only PDF files are supported for AI parsing. Please upload a PDF or enter data manually.",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Step 1: Extract text from PDF
    const pdfResult = await parsePDF(file);
    const cleanText = cleanExtractedText(pdfResult.text);

    if (!cleanText || cleanText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract sufficient text from PDF. The file may be scanned or image-based. Please enter data manually.",
        },
        { status: 400 }
      );
    }

    // Step 2: Extract certificate data using AI
    const extractionResult = await extractCertificateData(cleanText);

    if (!extractionResult.success) {
      return NextResponse.json(
        {
          error:
            extractionResult.error ||
            "Failed to extract certificate data. Please enter data manually.",
        },
        { status: 500 }
      );
    }

    // Return extracted data
    return NextResponse.json({
      success: true,
      data: extractionResult.data,
      warnings: extractionResult.warnings,
      metadata: {
        filename: file.name,
        numPages: pdfResult.numPages,
        textLength: cleanText.length,
      },
    });
  } catch (error) {
    console.error("Certificate parsing error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse certificate. Please enter data manually.",
      },
      { status: 500 }
    );
  }
}
