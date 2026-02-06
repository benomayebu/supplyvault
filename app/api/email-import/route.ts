import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBrand } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  fetchEmailsWithAttachments,
  getEmailMessage,
  downloadAttachment,
} from '@/lib/gmail';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { calculateFileHash, extractText, extractCertificateData } from '@/lib/extraction';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for long-running imports

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * POST /api/email-import
 * Fetch and process certificate emails from Gmail
 */
export async function POST(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!brand.gmail_refresh_token) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect Gmail first.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { maxEmails = 10 } = body;

    const results = {
      processed: 0,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      // Fetch emails with attachments
      const { messages } = await fetchEmailsWithAttachments(
        brand.gmail_refresh_token,
        {
          maxResults: maxEmails,
        }
      );

      for (const msg of messages) {
        try {
          // Check if already imported
          const existing = await prisma.emailImport.findUnique({
            where: { gmail_message_id: msg.id! },
          });

          if (existing) {
            results.skipped++;
            results.processed++;
            continue;
          }

          // Get full message details
          const messageDetails = await getEmailMessage(
            brand.gmail_refresh_token!,
            msg.id!
          );

          // Create email import record
          const emailImport = await prisma.emailImport.create({
            data: {
              brand_id: brand.id,
              gmail_message_id: messageDetails.id,
              sender_email: messageDetails.senderEmail,
              sender_name: messageDetails.senderName,
              subject: messageDetails.subject,
              received_date: messageDetails.date,
              attachment_count: messageDetails.attachments.length,
              status: 'PROCESSING',
            },
          });

          // Process each attachment
          for (const attachment of messageDetails.attachments) {
            try {
              // Download attachment
              const buffer = await downloadAttachment(
                brand.gmail_refresh_token!,
                messageDetails.id,
                attachment.attachmentId
              );

              // Calculate hash for deduplication
              const documentHash = calculateFileHash(buffer);

              // Check for duplicate certificate by hash
              const duplicate = await prisma.certification.findFirst({
                where: { document_hash: documentHash },
              });

              if (duplicate) {
                console.log(`Skipping duplicate certificate: ${attachment.filename}`);
                continue;
              }

              // Upload to S3
              const s3Key = `certifications/${brand.id}/${Date.now()}-${attachment.filename}`;
              await s3Client.send(
                new PutObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET || '',
                  Key: s3Key,
                  Body: buffer,
                  ContentType: attachment.mimeType,
                })
              );

              const documentUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

              // Extract text and certificate data
              let extractedData = null;
              let extractionConfidence = 0;
              let needsReview = true;

              try {
                const text = await extractText(buffer, attachment.mimeType);
                extractedData = extractCertificateData(text);
                extractionConfidence = extractedData.confidence;
                needsReview = extractionConfidence < 0.7; // Need review if confidence < 70%
              } catch (extractError) {
                console.error('Error extracting text:', extractError);
                // Continue without extracted data
              }

              // Find or create supplier based on sender email
              let supplier = await prisma.supplier.findFirst({
                where: {
                  brand_id: brand.id,
                  contact_email: messageDetails.senderEmail,
                },
              });

              if (!supplier) {
                // Create new supplier with basic info
                supplier = await prisma.supplier.create({
                  data: {
                    brand_id: brand.id,
                    name: messageDetails.senderName || messageDetails.senderEmail,
                    contact_email: messageDetails.senderEmail,
                    country: 'Unknown', // Will be updated later
                    supplier_type: 'OTHER',
                  },
                });
              }

              // Determine certification type and dates from extracted data
              const certificationType =
                extractedData?.certificationType || 'OTHER';
              const issueDate = extractedData?.issueDate || new Date();
              const expiryDate = extractedData?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

              // Calculate status
              const daysUntilExpiry = Math.floor(
                (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              let status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
              if (daysUntilExpiry < 0) {
                status = 'EXPIRED';
              } else if (daysUntilExpiry <= 90) {
                status = 'EXPIRING_SOON';
              } else {
                status = 'VALID';
              }

              // Create certification
              await prisma.certification.create({
                data: {
                  supplier_id: supplier.id,
                  certification_type: certificationType as any,
                  certification_name:
                    extractedData?.certificationType ||
                    attachment.filename.replace(/\.(pdf|jpg|jpeg|png)$/i, ''),
                  certificate_number: extractedData?.certificateNumber,
                  issuing_body: extractedData?.issuingBody || 'Unknown',
                  issue_date: issueDate,
                  expiry_date: expiryDate,
                  document_url: documentUrl,
                  document_hash: documentHash,
                  status,
                  extracted_data: extractedData as any,
                  extraction_confidence: extractionConfidence,
                  needs_review: needsReview,
                  email_import_id: emailImport.id,
                  verification_status: 'PENDING',
                },
              });

              results.imported++;
            } catch (attachError) {
              console.error('Error processing attachment:', attachError);
              results.errors.push(
                `Failed to process ${attachment.filename}: ${attachError instanceof Error ? attachError.message : 'Unknown error'}`
              );
              results.failed++;
            }
          }

          // Update email import status
          await prisma.emailImport.update({
            where: { id: emailImport.id },
            data: {
              status: 'COMPLETED',
              processed_at: new Date(),
            },
          });

          results.processed++;
        } catch (msgError) {
          console.error('Error processing message:', msgError);
          results.errors.push(
            `Failed to process email: ${msgError instanceof Error ? msgError.message : 'Unknown error'}`
          );
          results.failed++;
          results.processed++;
        }
      }

      return NextResponse.json({
        success: true,
        results,
      });
    } catch (error) {
      console.error('Error importing emails:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to import emails',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in email import endpoint:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email-import
 * Get email import history
 */
export async function GET(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imports = await prisma.emailImport.findMany({
      where: { brand_id: brand.id },
      include: {
        certifications: {
          select: {
            id: true,
            certification_name: true,
            status: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      imports,
    });
  } catch (error) {
    console.error('Error fetching email imports:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
