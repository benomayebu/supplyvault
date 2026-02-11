# Quick Start: Phase 4 - Document Management

This guide will help you implement document upload, storage, and viewing functionality for certifications.

## Overview

Currently, the certification upload form exists but doesn't actually handle file uploads. This phase completes that functionality by:
1. Adding real file upload to certification forms
2. Storing documents in AWS S3
3. Building a document viewer
4. Implementing secure document access

**Estimated Time:** 1-2 weeks  
**Complexity:** Low-Medium  
**Prerequisites:** AWS account with S3 access

---

## Step 1: AWS S3 Setup (15 minutes)

### 1.1 Create S3 Bucket

1. Log into AWS Console
2. Navigate to S3
3. Click "Create bucket"
4. Configuration:
   ```
   Bucket name: supplyvault-certificates-[env]
   Region: us-east-1 (or your preferred region)
   
   Block all public access: ✓ ENABLED (documents are private)
   Bucket Versioning: ✓ ENABLED (keep file history)
   Default encryption: ✓ ENABLED (SSE-S3)
   ```

### 1.2 Create IAM User for S3 Access

1. Go to IAM → Users → Create user
2. User name: `supplyvault-s3-user`
3. Attach policy: Create inline policy
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::supplyvault-certificates-*",
           "arn:aws:s3:::supplyvault-certificates-*/*"
         ]
       }
     ]
   }
   ```
4. Create access key → Save credentials securely

### 1.3 Update Environment Variables

Add to `.env.local`:
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=supplyvault-certificates-dev
NEXT_PUBLIC_AWS_S3_BUCKET_URL=https://supplyvault-certificates-dev.s3.us-east-1.amazonaws.com
```

Add to Vercel (for production):
```bash
# Same variables, but use production bucket name
AWS_S3_BUCKET_NAME=supplyvault-certificates-prod
```

---

## Step 2: Update Database Schema (5 minutes)

The `Certification` model already has `document_url` field, but let's verify:

```bash
npx prisma studio
# Check the Certification model has document_url: String
```

If you need to add file metadata (optional):
```prisma
model Certification {
  // ... existing fields
  document_url       String
  document_filename  String?  // Original filename
  document_size      Int?     // File size in bytes
  document_type      String?  // MIME type
  // ... rest of model
}
```

If you add new fields, run migration:
```bash
npx prisma migrate dev --name add_document_metadata
```

---

## Step 3: Create S3 Utility Functions (30 minutes)

The project already has S3 utilities in `/lib/s3.ts`. Let's enhance them:

**File: `/lib/s3.ts`** (update existing or create if missing)

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Generate a signed URL for secure document access
 * URL expires after 1 hour
 */
export async function getSignedDocumentUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  return signedUrl;
}

/**
 * Delete a document from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
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
  const extension = filename.split('.').pop();
  return `certifications/${supplierId}/${certificationId}_${timestamp}.${extension}`;
}
```

---

## Step 4: Update Certification Upload API (1 hour)

**File: `/app/api/certifications/upload/route.ts`**

Update the existing route to handle file uploads:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { uploadToS3, generateCertificationKey } from "@/lib/s3";
import { CertificationStatus, CertificationType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get supplier profile
    const supplier = await prisma.supplier.findUnique({
      where: { clerk_user_id: userId },
      select: { id: true },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("document") as File | null;
    
    // Extract certification data
    const certificationData = {
      certification_type: formData.get("certification_type") as CertificationType,
      certification_name: formData.get("certification_name") as string,
      issuing_body: formData.get("issuing_body") as string,
      issue_date: new Date(formData.get("issue_date") as string),
      expiry_date: new Date(formData.get("expiry_date") as string),
    };

    // Validate required fields
    if (!certificationData.certification_type || !certificationData.certification_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate status based on expiry date
    const today = new Date();
    const daysUntilExpiry = Math.floor(
      (certificationData.expiry_date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: CertificationStatus;
    if (daysUntilExpiry < 0) {
      status = "EXPIRED";
    } else if (daysUntilExpiry <= 90) {
      status = "EXPIRING_SOON";
    } else {
      status = "VALID";
    }

    // Handle file upload if provided
    let documentUrl = "";
    if (file && file.size > 0) {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size exceeds 10MB limit" },
          { status: 400 }
        );
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only PDF, JPEG, and PNG are allowed." },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create certification first to get ID
      const certification = await prisma.certification.create({
        data: {
          supplier_id: supplier.id,
          ...certificationData,
          status,
          document_url: "pending", // Temporary
        },
      });

      // Upload to S3
      const s3Key = generateCertificationKey(
        supplier.id,
        certification.id,
        file.name
      );
      documentUrl = await uploadToS3(buffer, s3Key, file.type);

      // Update certification with S3 URL
      await prisma.certification.update({
        where: { id: certification.id },
        data: { document_url: documentUrl },
      });

      return NextResponse.json({
        success: true,
        certification,
      });
    } else {
      // Create certification without document
      const certification = await prisma.certification.create({
        data: {
          supplier_id: supplier.id,
          ...certificationData,
          status,
          document_url: "", // No document uploaded
        },
      });

      return NextResponse.json({
        success: true,
        certification,
      });
    }
  } catch (error) {
    console.error("Error uploading certification:", error);
    return NextResponse.json(
      { error: "Failed to upload certification" },
      { status: 500 }
    );
  }
}
```

---

## Step 5: Update Upload Form (1 hour)

**File: `/app/supplier/certifications/upload/page.tsx`**

Add file input to the form:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadCertificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const response = await fetch("/api/certifications/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Certification uploaded successfully!");
        router.push("/supplier/dashboard");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload certification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Certification</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Existing form fields... */}
        
        {/* NEW: File Upload Field */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Document (Optional)
          </label>
          <input
            type="file"
            name="document"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            PDF, JPEG, or PNG (max 10MB)
          </p>
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "Uploading..." : "Upload Certification"}
        </button>
      </form>
    </div>
  );
}
```

---

## Step 6: Create Document Viewer Component (2 hours)

**Install PDF viewer:**
```bash
npm install react-pdf pdfjs-dist
```

**File: `/components/certifications/DocumentViewer.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  url: string;
  filename?: string;
}

export default function DocumentViewer({ url, filename }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const isPdf = url.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png)$/i.test(url);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{filename || "Document"}</h3>
        <a
          href={url}
          download
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Download
        </a>
      </div>

      {loading && <p className="text-center py-8">Loading document...</p>}

      {isPdf && (
        <div>
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-center py-8">Loading PDF...</div>}
          >
            <Page pageNumber={pageNumber} />
          </Document>

          {numPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {isImage && (
        <img src={url} alt={filename} className="max-w-full h-auto" />
      )}

      {!isPdf && !isImage && (
        <p className="text-center py-8 text-gray-500">
          Preview not available. Please download to view.
        </p>
      )}
    </div>
  );
}
```

---

## Step 7: Add Document Access API (30 minutes)

**File: `/app/api/certifications/[id]/document/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getSignedDocumentUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get certification
    const certification = await prisma.certification.findUnique({
      where: { id: params.id },
      include: {
        supplier: {
          select: {
            id: true,
            clerk_user_id: true,
            brand_id: true,
          },
        },
      },
    });

    if (!certification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const isSupplierOwner = certification.supplier.clerk_user_id === userId;
    
    // Check if user is brand owner
    const isBrandOwner = certification.supplier.brand_id
      ? await prisma.brand.findFirst({
          where: {
            id: certification.supplier.brand_id,
            clerk_user_id: userId,
          },
        })
      : null;

    if (!isSupplierOwner && !isBrandOwner) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    if (!certification.document_url) {
      return NextResponse.json(
        { error: "No document available" },
        { status: 404 }
      );
    }

    // Extract S3 key from URL
    const s3Key = certification.document_url.split(".amazonaws.com/")[1];
    
    if (!s3Key) {
      // Direct URL (not in S3)
      return NextResponse.json({ url: certification.document_url });
    }

    // Generate signed URL
    const signedUrl = await getSignedDocumentUrl(s3Key);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error getting document:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}
```

---

## Step 8: Update Certification List (1 hour)

Add document indicators to the certification list:

**File: Update your certification list component**

```typescript
{certifications.map((cert) => (
  <div key={cert.id} className="border p-4 rounded">
    <h3>{cert.certification_name}</h3>
    <p>{cert.certification_type}</p>
    
    {/* NEW: Document indicator */}
    {cert.document_url && (
      <a
        href={`/api/certifications/${cert.id}/document`}
        target="_blank"
        className="text-blue-600 hover:underline text-sm flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Document
      </a>
    )}
  </div>
))}
```

---

## Step 9: Testing Checklist

### Test File Upload
- [ ] Upload a PDF (< 10MB)
- [ ] Upload a JPEG/PNG (< 10MB)
- [ ] Try uploading > 10MB file (should fail)
- [ ] Try uploading unsupported file type (should fail)
- [ ] Submit form without file (should work)

### Test Document Viewing
- [ ] View PDF document
- [ ] View image document
- [ ] Navigate PDF pages (if multi-page)
- [ ] Download document
- [ ] Access document as supplier owner
- [ ] Try accessing another supplier's document (should fail)

### Test S3 Integration
- [ ] Check file appears in S3 bucket
- [ ] Verify file naming convention
- [ ] Check file permissions (should be private)
- [ ] Verify signed URLs expire after 1 hour

---

## Common Issues & Solutions

### Issue: "AWS credentials not found"
**Solution:** Verify `.env.local` has correct AWS credentials

### Issue: "Bucket not found"
**Solution:** Check bucket name in environment variables matches actual bucket

### Issue: "Access denied to S3"
**Solution:** Verify IAM user has correct permissions

### Issue: "PDF not rendering"
**Solution:** Make sure PDF.js worker is configured correctly

### Issue: "File upload fails silently"
**Solution:** Check browser console for errors, verify file size limits

---

## Next Steps

After completing Phase 4:
1. Test thoroughly with real documents
2. Monitor S3 costs
3. Consider adding document thumbnails
4. Move to Phase 5: AI Certification Parsing

---

## Quick Reference

### S3 File Structure
```
supplyvault-certificates-dev/
└── certifications/
    └── {supplier_id}/
        └── {certification_id}_{timestamp}.pdf
```

### Environment Variables
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=supplyvault-certificates-dev
```

### Key Files
- `/lib/s3.ts` - S3 utilities
- `/app/api/certifications/upload/route.ts` - Upload API
- `/app/api/certifications/[id]/document/route.ts` - Document access API
- `/components/certifications/DocumentViewer.tsx` - Viewer component
- `/app/supplier/certifications/upload/page.tsx` - Upload form

---

**Ready to start?** Follow the steps above in order, testing as you go!
