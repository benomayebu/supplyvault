import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";
import { CertificationType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const file = formData.get("file") as File;
    const supplierId = formData.get("supplierId") as string;
    const certificationType = formData.get(
      "certificationType"
    ) as CertificationType;
    const certificationName = formData.get("certificationName") as string;
    const certificateNumber = formData.get("certificateNumber") as string;
    const issuingBody = formData.get("issuingBody") as string;
    const issueDate = formData.get("issueDate") as string;
    const expiryDate = formData.get("expiryDate") as string;

    // Validate required fields
    if (
      !file ||
      !supplierId ||
      !certificationType ||
      !certificationName ||
      !certificateNumber ||
      !issuingBody ||
      !issueDate ||
      !expiryDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, JPG, or PNG" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${supplierId}_${timestamp}_${sanitizedFilename}`;

    // Save file to public/uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "certificates");
    const { mkdir } = await import("fs/promises");
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Create public URL for the file
    const documentUrl = `/uploads/certificates/${filename}`;

    // Calculate certification status based on expiry date
    const expiryDateTime = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: "VALID" | "EXPIRING_SOON" | "EXPIRED";
    if (daysUntilExpiry < 0) {
      status = "EXPIRED";
    } else if (daysUntilExpiry <= 90) {
      status = "EXPIRING_SOON";
    } else {
      status = "VALID";
    }

    // Create certification record in database
    const certification = await prisma.certification.create({
      data: {
        supplier_id: supplierId,
        certification_type: certificationType,
        certification_name: certificationName,
        issuing_body: issuingBody,
        issue_date: new Date(issueDate),
        expiry_date: new Date(expiryDate),
        document_url: documentUrl,
        status: status,
      },
    });

    return NextResponse.json({
      success: true,
      certification: {
        id: certification.id,
        certification_type: certification.certification_type,
        certification_name: certification.certification_name,
        status: certification.status,
        expiry_date: certification.expiry_date,
      },
    });
  } catch (error) {
    console.error("Certificate upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload certificate",
      },
      { status: 500 }
    );
  }
}
