import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

/**
 * Upload a file to S3 and return the URL
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

/**
 * Generate a unique S3 key for a certification document
 */
export function generateCertificationKey(
  supplierId: string,
  certificationId: string,
  filename: string
): string {
  const timestamp = Date.now();
  // Sanitize filename to remove special characters
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `certifications/${supplierId}/${certificationId}_${timestamp}_${safeName}`;
}

/**
 * Generate a pre-signed URL for uploading a file to S3
 */
export async function generateUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ signedUrl: string; key: string }> {
  const key = `certifications/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return { signedUrl, key };
}

/**
 * Generate a pre-signed URL for downloading/viewing a file from S3
 * URL expires after specified time (default 1 hour)
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
  }

  // Extract key from full URL if needed
  const s3Key = key.includes("s3.amazonaws.com/")
    ? key.split("s3.amazonaws.com/")[1]
    : key;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Delete a document from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set");
  }

  // Extract key from full URL if needed
  const s3Key = key.includes("s3.amazonaws.com/")
    ? key.split("s3.amazonaws.com/")[1]
    : key;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  await s3Client.send(command);
}

/**
 * Get the public URL for an S3 object
 */
export function getS3Url(key: string): string {
  // If already a full URL, return as-is
  if (key.startsWith("http")) {
    return key;
  }

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "File must be a PDF, JPG, or PNG",
    };
  }

  return { valid: true };
}
