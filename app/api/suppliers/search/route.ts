import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Prisma, SupplierType, VerificationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const country = searchParams.get("country");
    const supplierType = searchParams.get("type") as SupplierType | null;
    const verificationStatus = searchParams.get(
      "verification"
    ) as VerificationStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(searchParams.get("perPage") || "20"),
      100
    );

    // Build where clause
    const where: Prisma.SupplierWhereInput = {
      // Only show suppliers with clerk_user_id (independent suppliers)
      clerk_user_id: { not: null },
    };

    // Add search filter
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
      ];
    }

    // Add country filter
    if (country) {
      where.country = country;
    }

    // Add supplier type filter
    if (supplierType) {
      where.supplier_type = supplierType;
    }

    // Add verification status filter
    if (verificationStatus) {
      where.verification_status = verificationStatus;
    }

    // Get total count for pagination
    const total = await prisma.supplier.count({ where });

    // Get suppliers with certifications
    const suppliers = await prisma.supplier.findMany({
      where,
      select: {
        id: true,
        name: true,
        country: true,
        supplier_type: true,
        verification_status: true,
        manufacturing_capabilities: true,
        created_at: true,
        certifications: {
          select: {
            id: true,
            certification_type: true,
            certification_name: true,
            expiry_date: true,
            status: true,
          },
          orderBy: { expiry_date: "desc" },
        },
      },
      orderBy: [
        { verification_status: "desc" }, // Verified first
        { created_at: "desc" },
      ],
      skip: (page - 1) * perPage,
      take: perPage,
    });

    // Add certification count to each supplier
    const suppliersWithCounts = suppliers.map((supplier) => ({
      ...supplier,
      certificationCount: supplier.certifications.length,
      capabilities: supplier.manufacturing_capabilities
        ? JSON.parse(supplier.manufacturing_capabilities)
        : [],
    }));

    return NextResponse.json({
      suppliers: suppliersWithCounts,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error searching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to search suppliers" },
      { status: 500 }
    );
  }
}
