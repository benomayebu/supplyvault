/**
 * PDF Parser Utility
 * Extracts text content from PDF files for AI processing
 */

import * as pdfParse from "pdf-parse";

export interface PDFParseResult {
  text: string;
  numPages: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

/**
 * Extract text from a PDF buffer
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<PDFParseResult> {
  try {
    // @ts-expect-error - pdf-parse has quirky types
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      numPages: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        keywords: data.info?.Keywords,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate: data.info?.CreationDate
          ? new Date(data.info.CreationDate)
          : undefined,
        modificationDate: data.info?.ModDate
          ? new Date(data.info.ModDate)
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Extract text from a PDF file (accepts File or Buffer)
 */
export async function parsePDF(file: File | Buffer): Promise<PDFParseResult> {
  let buffer: Buffer;

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  return extractTextFromPDF(buffer);
}

/**
 * Clean and normalize extracted text
 * Removes excessive whitespace, normalizes line breaks
 */
export function cleanExtractedText(text: string): string {
  return (
    text
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      // Remove excessive whitespace
      .replace(/[ \t]+/g, " ")
      // Remove excessive line breaks (max 2)
      .replace(/\n{3,}/g, "\n\n")
      // Trim each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Trim overall
      .trim()
  );
}
