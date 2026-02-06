import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "";

export interface SavedAttachment {
  key: string;
  url: string;
  size: number;
  sha256: string;
}

export async function saveAttachmentToS3(
  fileName: string,
  base64Content: string,
  contentType: string
): Promise<SavedAttachment> {
  const buffer = Buffer.from(base64Content, "base64");

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const key = `certifications/${Date.now()}-${sha256.slice(0, 8)}-${fileName}`;

  const put = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(put);

  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

  return {
    key,
    url,
    size: buffer.length,
    sha256,
  };
}

export function fingerprintBuffer(base64Content: string): string {
  const buffer = Buffer.from(base64Content, "base64");
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
