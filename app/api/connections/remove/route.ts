import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentBrand } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current brand
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const supplier_id = searchParams.get("supplier_id");

    if (!supplier_id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    // Find connection
    const connection = await prisma.supplierConnection.findUnique({
      where: {
        brand_id_supplier_id: {
          brand_id: brand.id,
          supplier_id: supplier_id,
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Mark as disconnected instead of deleting (for historical records)
    await prisma.supplierConnection.update({
      where: { id: connection.id },
      data: { status: "DISCONNECTED" },
    });

    return NextResponse.json({
      message: "Supplier connection removed successfully",
    });
  } catch (error) {
    console.error("Error removing supplier connection:", error);
    return NextResponse.json(
      { error: "Failed to remove supplier connection" },
      { status: 500 }
    );
  }
}
