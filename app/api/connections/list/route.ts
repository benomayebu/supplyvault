import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentBrand } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current brand
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Get all connected suppliers
    const connections = await prisma.supplierConnection.findMany({
      where: {
        brand_id: brand.id,
        status: "CONNECTED",
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            country: true,
            supplier_type: true,
            verification_status: true,
            manufacturing_capabilities: true,
            certifications: {
              select: {
                id: true,
                certification_type: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Format response
    const formattedConnections = connections.map((conn) => ({
      connection_id: conn.id,
      connected_at: conn.created_at,
      notes: conn.notes,
      supplier: {
        ...conn.supplier,
        certificationCount: conn.supplier.certifications.length,
        capabilities: conn.supplier.manufacturing_capabilities
          ? JSON.parse(conn.supplier.manufacturing_capabilities)
          : [],
      },
    }));

    return NextResponse.json({
      connections: formattedConnections,
      total: formattedConnections.length,
    });
  } catch (error) {
    console.error("Error listing supplier connections:", error);
    return NextResponse.json(
      { error: "Failed to list supplier connections" },
      { status: 500 }
    );
  }
}
