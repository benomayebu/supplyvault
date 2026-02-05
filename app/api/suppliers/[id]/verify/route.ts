import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

interface VerifySupplierBody {
  status: "UNVERIFIED" | "BASIC" | "VERIFIED";
}

/**
 * PATCH /api/suppliers/[id]/verify
 * Update supplier verification status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Clerk user ID for audit trail
    const { userId } = await auth();

    const body: VerifySupplierBody = await request.json();
    const { status } = body;

    if (!status || !["UNVERIFIED", "BASIC", "VERIFIED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400 }
      );
    }

    // Check if supplier belongs to this brand
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: params.id,
        brand_id: brand.id,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Update verification status
    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        verification_status: status,
        verified_at: status === "VERIFIED" ? new Date() : null,
        verified_by: status === "VERIFIED" ? userId : null,
      },
    });

    return NextResponse.json({
      success: true,
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("Error updating supplier verification:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
