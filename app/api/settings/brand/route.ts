import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateBrandSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  country: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateBrandSchema.parse(body);

    const updatedBrand = await prisma.brand.update({
      where: { id: brand.id },
      data: {
        company_name: validatedData.company_name,
        country: validatedData.country || null,
      },
      select: {
        id: true,
        company_name: true,
        email: true,
        country: true,
        subscription_tier: true,
      },
    });

    return NextResponse.json({ brand: updatedBrand });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}
