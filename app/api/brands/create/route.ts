import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      company_name,
      country,
      address,
      annual_volume,
      required_certifications,
    } = body;

    // Validate required fields
    if (!company_name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Check if brand already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { clerk_user_id: userId },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Brand profile already exists" },
        { status: 409 }
      );
    }

    // Create brand record with Clerk user ID
    const brand = await prisma.brand.create({
      data: {
        clerk_user_id: userId,
        company_name,
        email,
        country: country || null,
        address: address || null,
        annual_volume: annual_volume || null,
        required_certifications: required_certifications || null,
        subscription_tier: "FREE",
      },
    });

    // Also create a user record for the brand owner
    await prisma.user.create({
      data: {
        clerk_user_id: userId,
        brand_id: brand.id,
        email,
        full_name: user.fullName || email.split("@")[0],
        role: "ADMIN",
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand profile" },
      { status: 500 }
    );
  }
}
