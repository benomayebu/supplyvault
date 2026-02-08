import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentSupplier } from "@/lib/auth";
import { SupplierType } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current supplier
    const supplier = await getCurrentSupplier();
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      country,
      address,
      contact_email,
      contact_phone,
      supplier_type,
      manufacturing_capabilities,
    } = body;

    // Validate required fields
    if (!name || !country) {
      return NextResponse.json(
        { error: "Name and country are required" },
        { status: 400 }
      );
    }

    // Update supplier
    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        name,
        country,
        address: address || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        supplier_type: supplier_type ? (supplier_type as SupplierType) : null,
        manufacturing_capabilities: manufacturing_capabilities || null,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      supplier: {
        id: updatedSupplier.id,
        name: updatedSupplier.name,
        country: updatedSupplier.country,
      },
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}
