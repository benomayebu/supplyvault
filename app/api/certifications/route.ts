import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { createCertification } from "@/lib/db";
import { CreateCertificationInput } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const certificationData: CreateCertificationInput = {
      supplier_id: body.supplier_id,
      certification_type: body.certification_type,
      certification_name: body.certification_name,
      issuing_body: body.issuing_body,
      issue_date: new Date(body.issue_date),
      expiry_date: new Date(body.expiry_date),
      document_url: body.document_url,
    };

    const certification = await createCertification(certificationData);

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error("Error creating certification:", error);
    return NextResponse.json(
      { error: "Failed to create certification" },
      { status: 500 }
    );
  }
}
