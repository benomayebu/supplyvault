import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const onboardingSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(255),
  country: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Get the current authenticated user's brand
    const brand = await getCurrentBrand();

    if (!brand) {
      return NextResponse.json(
        { error: "Unauthorized - Brand not found. Please ensure you're signed in." },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    // Update the brand record with onboarding data
    const updatedBrand = await prisma.brand.update({
      where: { id: brand.id },
      data: {
        company_name: validatedData.company_name.trim(),
        country: validatedData.country || null,
      },
      select: {
        id: true,
        company_name: true,
        email: true,
        country: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      brand: updatedBrand,
    });
  } catch (error) {
    console.error("Onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to complete onboarding. Please try again." },
      { status: 500 }
    );
  }
}

