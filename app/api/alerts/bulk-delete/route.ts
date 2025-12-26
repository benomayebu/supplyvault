import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { alertIds } = body;

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json({ error: "Invalid alert IDs" }, { status: 400 });
    }

    // Delete multiple alerts
    await prisma.alert.deleteMany({
      where: {
        id: { in: alertIds },
        brand_id: brand.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alerts:", error);
    return NextResponse.json(
      { error: "Failed to delete alerts" },
      { status: 500 }
    );
  }
}
