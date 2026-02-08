import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentBrand } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { supplier_id, notes } = body;

    if (!supplier_id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    // Check if supplier exists and is independent
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: supplier_id,
        clerk_user_id: { not: null }, // Only independent suppliers
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found or not available for connection" },
        { status: 404 }
      );
    }

    // Check if connection already exists
    const existingConnection = await prisma.supplierConnection.findUnique({
      where: {
        brand_id_supplier_id: {
          brand_id: brand.id,
          supplier_id: supplier_id,
        },
      },
    });

    if (existingConnection) {
      // If disconnected, reconnect it
      if (existingConnection.status === "DISCONNECTED") {
        const updatedConnection = await prisma.supplierConnection.update({
          where: { id: existingConnection.id },
          data: {
            status: "CONNECTED",
            notes: notes || existingConnection.notes,
          },
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                country: true,
                supplier_type: true,
                verification_status: true,
              },
            },
          },
        });

        return NextResponse.json({
          message: "Supplier reconnected successfully",
          connection: updatedConnection,
        });
      }

      return NextResponse.json(
        { error: "Supplier already connected" },
        { status: 409 }
      );
    }

    // Create new connection
    const connection = await prisma.supplierConnection.create({
      data: {
        brand_id: brand.id,
        supplier_id: supplier_id,
        status: "CONNECTED",
        notes: notes || null,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            country: true,
            supplier_type: true,
            verification_status: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Supplier added successfully",
      connection,
    });
  } catch (error) {
    console.error("Error adding supplier connection:", error);
    return NextResponse.json(
      { error: "Failed to add supplier connection" },
      { status: 500 }
    );
  }
}
