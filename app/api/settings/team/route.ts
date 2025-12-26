import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { getTeamMembers } from "@/lib/settings";

export async function GET() {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await getTeamMembers(brand.id);
    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
