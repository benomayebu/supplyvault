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

    // Mark multiple alerts as read
    await prisma.alert.updateMany({
      where: {
        id: { in: alertIds },
        brand_id: brand.id,
      },
      data: {
        is_read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking alerts as read:", error);
    return NextResponse.json(
      { error: "Failed to mark alerts as read" },
      { status: 500 }
    );
  }
}
