import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { createSupplier } from "@/lib/db";
import { CreateSupplierInput } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const supplierData: CreateSupplierInput = {
      brand_id: brand.id,
      name: body.name,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      country: body.country,
      address: body.address,
      supplier_type: body.supplier_type,
    };

    const supplier = await createSupplier(supplierData);

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
