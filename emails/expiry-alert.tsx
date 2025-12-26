import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ExpiryAlertEmailProps {
  supplierName: string;
  certificationName: string;
  certificationType: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  certificationUrl: string;
}

export function ExpiryAlertEmail({
  supplierName,
  certificationName,
  certificationType,
  expiryDate,
  daysUntilExpiry,
  certificationUrl,
}: ExpiryAlertEmailProps) {
  const formattedDate = new Date(expiryDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isExpired = daysUntilExpiry <= 0;
  const urgencyColor = isExpired
    ? "#DC2626"
    : daysUntilExpiry <= 7
      ? "#DC2626"
      : daysUntilExpiry <= 30
        ? "#F59E0B"
        : "#3B82F6";

  return (
    <Html>
      <Head />
      <Preview>
        {isExpired
          ? `${certificationName} for ${supplierName} has expired`
          : `${certificationName} for ${supplierName} expires in ${daysUntilExpiry} days`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>SupplyVault</Heading>
          </Section>

          <Section style={content}>
            <Heading style={title}>
              {isExpired
                ? "Certification Expired"
                : `Certification Expiring in ${daysUntilExpiry} Days`}
            </Heading>

            <Text style={paragraph}>
              This is an automated alert from SupplyVault regarding an
              expiring certification.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Supplier:</Text>
              <Text style={infoValue}>{supplierName}</Text>

              <Text style={infoLabel}>Certification:</Text>
              <Text style={infoValue}>{certificationName}</Text>

              <Text style={infoLabel}>Type:</Text>
              <Text style={infoValue}>{certificationType}</Text>

              <Text style={infoLabel}>Expiry Date:</Text>
              <Text style={{ ...infoValue, color: urgencyColor }}>
                {formattedDate}
              </Text>
            </Section>

            {!isExpired && (
              <Text style={paragraph}>
                Please take action to renew this certification before it
                expires.
              </Text>
            )}

            {isExpired && (
              <Text style={{ ...paragraph, color: urgencyColor }}>
                This certification has expired. Please renew immediately.
              </Text>
            )}

            <Section style={buttonContainer}>
              <Link href={certificationUrl} style={button}>
                View Certification
              </Link>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated message from SupplyVault. Please do not
              reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#F5F5F5",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#0A2463",
  padding: "24px",
  textAlign: "center" as const,
};

const heading = {
  color: "#3BCEAC",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "32px 24px",
};

const title = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#0A2463",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px",
};

const infoBox = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const infoLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6B7280",
  margin: "8px 0 4px",
};

const infoValue = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0A2463",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  borderTop: "1px solid #E5E7EB",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0",
};

