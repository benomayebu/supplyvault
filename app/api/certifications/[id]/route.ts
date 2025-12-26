import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import {
  deleteCertification,
  updateCertification,
  getCertificationById,
} from "@/lib/db";
import { UpdateCertificationInput } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify certification belongs to brand
    const certification = await getCertificationById(params.id);
    if (!certification || certification.supplier.brand_id !== brand.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteCertification(params.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { error: "Failed to delete certification" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify certification belongs to brand
    const certification = await getCertificationById(params.id);
    if (!certification || certification.supplier.brand_id !== brand.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const updateData: UpdateCertificationInput = {};

    if (body.certification_name) {
      updateData.certification_name = body.certification_name;
    }
    if (body.issuing_body !== undefined) {
      updateData.issuing_body = body.issuing_body;
    }
    if (body.issue_date) {
      updateData.issue_date = new Date(body.issue_date);
    }
    if (body.expiry_date) {
      updateData.expiry_date = new Date(body.expiry_date);
    }

    const updated = await updateCertification(params.id, updateData);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 }
    );
  }
}
