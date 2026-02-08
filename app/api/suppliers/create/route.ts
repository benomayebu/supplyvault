import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      country,
      address,
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
        supplier_type: supplier_type || null,
        manufacturing_capabilities: manufacturing_capabilities || null,
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
