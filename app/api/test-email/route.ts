import { NextResponse } from "next/server";
import { sendExpiryAlertEmail } from "@/lib/email";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Test endpoint to manually trigger a test email
 * Usage: GET /api/test-email?to=your-email@example.com
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get("to");

    if (!toEmail) {
      return NextResponse.json(
        {
          error:
            "Missing 'to' query parameter. Usage: /api/test-email?to=your-email@example.com",
        },
        { status: 400 }
      );
    }

    // Send a test email
    const result = await sendExpiryAlertEmail({
      to: toEmail,
      supplierName: "Test Supplier Co.",
      certificationName: "GOTS Organic Textile Standard",
      certificationType: "GOTS",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      daysUntilExpiry: 30,
      certificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/certifications/test-123`,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${toEmail}`,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
