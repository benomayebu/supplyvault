import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if supplier profile already exists for this user
    const existingSupplier = await prisma.supplier.findUnique({
      where: { clerk_user_id: userId },
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: "Supplier profile already exists" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const {
      name,
      country,
      address,
      registration_number,
      website,
      description,
      supplier_type,
      manufacturing_capabilities,
    } = body;

    // Validate required fields
    if (!name || !country) {
      return NextResponse.json(
        { error: "Company name and country are required" },
        { status: 400 }
      );
    }

    // Create supplier record with Clerk user ID
    const supplier = await prisma.supplier.create({
      data: {
        clerk_user_id: userId,
        name,
        country,
        address: address || null,
        registration_number: registration_number || null,
        website: website || null,
        description: description || null,
        supplier_type: supplier_type || null,
        manufacturing_capabilities: manufacturing_capabilities || null,
        visible_in_search: false,
        contact_email: null,
        contact_phone: null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier profile" },
      { status: 500 }
    );
  }
}
