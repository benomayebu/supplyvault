import { Resend } from "resend";
import { render } from "@react-email/render";
import { ExpiryAlertEmail } from "@/emails/expiry-alert";

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY || "placeholder-key-for-build";
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

interface SendExpiryAlertParams {
  to: string;
  supplierName: string;
  certificationName: string;
  certificationType: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  certificationUrl: string;
}

/**
 * Send expiry alert email
 */
export async function sendExpiryAlertEmail({
  to,
  supplierName,
  certificationName,
  certificationType,
  expiryDate,
  daysUntilExpiry,
  certificationUrl,
}: SendExpiryAlertParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return { success: false, error: "Email service not configured" };
    }

    const subject =
      daysUntilExpiry === 0
        ? "[SupplyVault] Certification expired today"
        : `[SupplyVault] Certification expiring in ${daysUntilExpiry} days`;

    const emailHtml = await render(
      ExpiryAlertEmail({
        supplierName,
        certificationName,
        certificationType,
        expiryDate,
        daysUntilExpiry,
        certificationUrl,
      })
    );

    const resend = getResend();
    const result = await resend.emails.send({
      from: "SupplyVault <notifications@supplyvault.com>",
      to: [to],
      subject,
      html: emailHtml,
    });

    if (result.error) {
      console.error("Error sending email:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending expiry alert email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
