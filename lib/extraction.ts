// @ts-ignore - pdf-parse has issues with TypeScript imports
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import crypto from 'crypto';

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from image buffer using OCR (Tesseract)
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker('eng');
  
  try {
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    return data.text;
  } catch (error) {
    await worker.terminate();
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text based on file type
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer);
  } else if (mimeType.startsWith('image/')) {
    return extractTextFromImage(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Calculate SHA-256 hash of file for deduplication
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Certificate data extraction patterns
 */
interface ExtractedData {
  certificateNumber?: string;
  issuingBody?: string;
  issueDate?: Date;
  expiryDate?: Date;
  companyName?: string;
  certificationType?: string;
  confidence: number;
}

/**
 * Extract certificate data from text using regex patterns
 */
export function extractCertificateData(text: string): ExtractedData {
  const data: ExtractedData = {
    confidence: 0,
  };

  let matchCount = 0;
  let totalPatterns = 0;

  // Certificate number patterns
  totalPatterns++;
  const certNumberPatterns = [
    /(?:certificate|cert|license|lic)\s*(?:no|number|#)\s*[:\s]*([A-Z0-9-]+)/i,
    /(?:registration|reg)\s*(?:no|number|#)\s*[:\s]*([A-Z0-9-]+)/i,
    /\b([A-Z]{2,4}[-\s]?\d{4,8}[-\s]?[A-Z0-9]{0,6})\b/,
  ];
  
  for (const pattern of certNumberPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.certificateNumber = match[1]?.trim();
      matchCount++;
      break;
    }
  }

  // Issuing body patterns
  totalPatterns++;
  const issuingBodyPatterns = [
    /(?:issued by|issuing body|certifying body)[:\s]*(.+?)(?:\n|$)/i,
    /(?:GOTS|OEKO-TEX|SA8000|BSCI|ISO\s*14001)/i,
  ];
  
  for (const pattern of issuingBodyPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.issuingBody = match[0]?.trim();
      matchCount++;
      break;
    }
  }

  // Certification type detection
  totalPatterns++;
  if (text.match(/GOTS|Global Organic Textile Standard/i)) {
    data.certificationType = 'GOTS';
    matchCount++;
  } else if (text.match(/OEKO-TEX|Oeko Tex/i)) {
    data.certificationType = 'OEKO_TEX';
    matchCount++;
  } else if (text.match(/SA\s*8000|Social Accountability/i)) {
    data.certificationType = 'SA8000';
    matchCount++;
  } else if (text.match(/BSCI|Business Social Compliance/i)) {
    data.certificationType = 'BSCI';
    matchCount++;
  } else if (text.match(/ISO\s*14001|Environmental Management/i)) {
    data.certificationType = 'ISO14001';
    matchCount++;
  }

  // Date patterns (various formats)
  totalPatterns++;
  const datePatterns = [
    // Issue date
    {
      regex: /(?:issue date|issued on|date of issue)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      type: 'issue',
    },
    {
      regex: /(?:issue date|issued on|date of issue)[:\s]*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/i,
      type: 'issue',
    },
    // Expiry date
    {
      regex: /(?:expiry date|expires on|valid until|expiration date)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      type: 'expiry',
    },
    {
      regex: /(?:expiry date|expires on|valid until|expiration date)[:\s]*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/i,
      type: 'expiry',
    },
  ];

  for (const { regex, type } of datePatterns) {
    const match = text.match(regex);
    if (match) {
      const dateStr = match[1];
      const parsedDate = parseDate(dateStr);
      if (parsedDate) {
        if (type === 'issue') {
          data.issueDate = parsedDate;
          matchCount++;
        } else {
          data.expiryDate = parsedDate;
          matchCount++;
        }
      }
    }
  }

  // Company name patterns
  totalPatterns++;
  const companyPatterns = [
    /(?:company|organization|facility)[:\s]*(.+?)(?:\n|$)/i,
    /certified\s+(?:company|organization|facility)[:\s]*(.+?)(?:\n|$)/i,
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.companyName = match[1].trim();
      matchCount++;
      break;
    }
  }

  // Calculate confidence score (0-1)
  data.confidence = matchCount / totalPatterns;

  return data;
}

/**
 * Parse date string in various formats
 */
function parseDate(dateStr: string): Date | null {
  // Try different date formats
  const formats = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
    // YYYY/MM/DD or YYYY-MM-DD
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // Determine which format matched
      if (match[0].startsWith('20') || match[0].startsWith('19')) {
        // YYYY-MM-DD format
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      } else {
        // Try DD-MM-YYYY first (common in Europe)
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        let year = parseInt(match[3]);
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
        
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime()) && date.getDate() === day) return date;
        
        // If that didn't work, try MM-DD-YYYY (common in US)
        const date2 = new Date(year, day - 1, month + 1);
        if (!isNaN(date2.getTime())) return date2;
      }
    }
  }

  return null;
}
