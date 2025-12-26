import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand, requireRole } from "@/lib/auth";
import { updateUserRole, removeUserFromBrand } from "@/lib/settings";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireRole(UserRole.ADMIN);
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = updateRoleSchema.parse(body);

    await updateUserRole(params.userId, role, brand.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update role",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireRole(UserRole.ADMIN);
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await removeUserFromBrand(params.userId, brand.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to remove user",
      },
      { status: 500 }
    );
  }
}
