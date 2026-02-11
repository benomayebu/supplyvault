import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateDownloadUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificationId = params.id;

    // Get certification with supplier and brand information
    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
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

    // Check if user is the brand owner (if supplier has a brand)
    let isBrandOwner = false;
    if (certification.supplier.brand_id) {
      const brand = await prisma.brand.findFirst({
        where: {
          id: certification.supplier.brand_id,
          clerk_user_id: userId,
        },
      });
      isBrandOwner = !!brand;
    }

    // Check if user has a brand connection to this supplier
    const userBrand = await prisma.brand.findFirst({
      where: { clerk_user_id: userId },
    });

    let hasConnection = false;
    if (userBrand) {
      const connection = await prisma.supplierConnection.findFirst({
        where: {
          brand_id: userBrand.id,
          supplier_id: certification.supplier.id,
          status: "CONNECTED",
        },
      });
      hasConnection = !!connection;
    }

    // Allow access if user is supplier owner, brand owner, or has connection
    if (!isSupplierOwner && !isBrandOwner && !hasConnection) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!certification.document_url) {
      return NextResponse.json(
        { error: "No document available" },
        { status: 404 }
      );
    }

    // If it's a local file path (starts with /), return as-is
    if (certification.document_url.startsWith("/")) {
      return NextResponse.json({
        url: certification.document_url,
        isPdf: certification.document_url.toLowerCase().endsWith(".pdf"),
        isImage: /\.(jpg|jpeg|png)$/i.test(certification.document_url),
      });
    }

    // Generate signed URL for S3 files
    const signedUrl = await generateDownloadUrl(certification.document_url);

    return NextResponse.json({
      url: signedUrl,
      isPdf: certification.document_url.toLowerCase().includes(".pdf"),
      isImage: /\.(jpg|jpeg|png)/i.test(certification.document_url),
    });
  } catch (error) {
    console.error("Error getting document:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}
