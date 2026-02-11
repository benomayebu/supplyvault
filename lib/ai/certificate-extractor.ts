/**
 * Certificate Data Extractor
 * Uses Claude API to extract structured data from certificate text
 */

import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// Initialize Anthropic client
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Define the schema for extracted certificate data
const CertificateDataSchema = z.object({
  certification_type: z
    .enum([
      "GOTS",
      "OEKO_TEX",
      "SA8000",
      "BSCI",
      "FAIR_WEAR",
      "ISO14001",
      "OTHER",
    ])
    .describe("The type of certification"),
  certification_name: z.string().describe("The full name of the certification"),
  issuing_body: z
    .string()
    .describe("The organization that issued the certificate"),
  issue_date: z.string().describe("Issue date in YYYY-MM-DD format"),
  expiry_date: z.string().describe("Expiry date in YYYY-MM-DD format"),
  certificate_number: z
    .string()
    .optional()
    .describe("The certificate number or reference ID"),
  scope: z
    .string()
    .optional()
    .describe("What the certification covers (e.g., products, processes)"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence in the extraction (0-1)"),
});

export type ExtractedCertificateData = z.infer<typeof CertificateDataSchema>;

export interface ExtractionResult {
  success: boolean;
  data?: ExtractedCertificateData;
  error?: string;
  warnings?: string[];
}

/**
 * Extract certificate data from text using Claude AI
 */
export async function extractCertificateData(
  text: string
): Promise<ExtractionResult> {
  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        success: false,
        error: "ANTHROPIC_API_KEY environment variable is not set",
      };
    }

    // Limit text size to avoid excessive API costs
    const maxLength = 10000; // ~2500 tokens
    const truncatedText =
      text.length > maxLength ? text.substring(0, maxLength) : text;

    const prompt = `You are an expert at extracting information from certification documents in the textile and fashion industry.

Analyze the following certificate text and extract the key information. Pay special attention to:

1. **Certification Type**: Identify if it's GOTS (Global Organic Textile Standard), OEKO-TEX, SA8000 (Social Accountability), BSCI (Business Social Compliance Initiative), Fair Wear Foundation, ISO 14001 (Environmental Management), or OTHER.

2. **Dates**: Look for issue date and expiry/validity date. Dates may be written in various formats (DD/MM/YYYY, MM/DD/YYYY, Month DD, YYYY, etc.). Convert to YYYY-MM-DD format.

3. **Certificate Number**: Often labeled as "Certificate No.", "License No.", "Registration No.", or similar.

4. **Issuing Body**: The organization or certification body that issued the certificate (e.g., Control Union, ECOCERT, Bureau Veritas).

5. **Scope**: What products, processes, or activities are covered by the certification.

Here is the certificate text:

${truncatedText}

Please extract the information with high accuracy. If you're not certain about a field, still provide your best estimate and indicate lower confidence.`;

    const result = await generateObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: CertificateDataSchema,
      prompt,
      temperature: 0.1, // Low temperature for more consistent extraction
    });

    const warnings: string[] = [];

    // Check confidence levels and add warnings
    if (result.object.confidence < 0.7) {
      warnings.push(
        "Overall extraction confidence is low. Please review all fields carefully."
      );
    }

    // Validate dates
    const issueDate = new Date(result.object.issue_date);
    const expiryDate = new Date(result.object.expiry_date);

    if (isNaN(issueDate.getTime())) {
      warnings.push("Issue date could not be parsed correctly. Please verify.");
    }

    if (isNaN(expiryDate.getTime())) {
      warnings.push(
        "Expiry date could not be parsed correctly. Please verify."
      );
    }

    if (
      !isNaN(issueDate.getTime()) &&
      !isNaN(expiryDate.getTime()) &&
      expiryDate <= issueDate
    ) {
      warnings.push(
        "Expiry date appears to be before or same as issue date. Please verify."
      );
    }

    return {
      success: true,
      data: result.object,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error("Error extracting certificate data:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract certificate data",
    };
  }
}

/**
 * Map certification type string to enum value
 */
export function mapCertificationType(
  type: string
): ExtractedCertificateData["certification_type"] {
  const normalized = type.toUpperCase().replace(/[^A-Z0-9]/g, "_");

  if (normalized.includes("GOTS")) return "GOTS";
  if (normalized.includes("OEKO") || normalized.includes("TEX"))
    return "OEKO_TEX";
  if (normalized.includes("SA8000")) return "SA8000";
  if (normalized.includes("BSCI")) return "BSCI";
  if (normalized.includes("FAIR") && normalized.includes("WEAR"))
    return "FAIR_WEAR";
  if (normalized.includes("ISO") && normalized.includes("14001"))
    return "ISO14001";

  return "OTHER";
}
