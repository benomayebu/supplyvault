import { NextRequest, NextResponse } from "next/server";
import { getSupplierReportData } from "@/lib/reports";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json(
        { error: "supplierId is required" },
        { status: 400 }
      );
    }

    // Fetch supplier data with certifications
    const reportData = await getSupplierReportData(supplierId);

    if (!reportData) {
      return NextResponse.json(
        { error: "Supplier not found or unauthorized" },
        { status: 404 }
      );
    }

    // Generate PDF
    const reportDate = new Date();
    const { ComplianceReportPDF: PDFComponent } =
      await import("@/components/reports/compliance-pdf");
    const pdfDoc = React.createElement(PDFComponent, {
      supplier: reportData.supplier,
      certifications: reportData.certifications,
      reportDate: reportDate,
    });

    // Type assertion needed because TypeScript doesn't infer that the component returns a Document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(pdfDoc as any);

    // Sanitize filename
    const sanitizedName = reportData.supplier.name.replace(
      /[^a-zA-Z0-9-]/g,
      "-"
    );
    const filename = `supplier-compliance-report-${sanitizedName}-${format(reportDate, "yyyy-MM-dd")}.pdf`;

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating compliance report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
