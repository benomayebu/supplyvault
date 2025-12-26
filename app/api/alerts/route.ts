import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { getAlertsByBrand } from "@/lib/db";

export async function GET() {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await getAlertsByBrand(brand.id, {
      take: 500, // Reasonable limit for API responses
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
