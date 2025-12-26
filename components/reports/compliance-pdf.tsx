import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { CertificationType, CertificationStatus } from "@prisma/client";

// Define styles with navy/teal colors
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  coverPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0A2463", // Navy
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0A2463",
    marginBottom: 30,
    textAlign: "center",
  },
  supplierName: {
    fontSize: 20,
    color: "#3BCEAC", // Teal
    marginBottom: 20,
    textAlign: "center",
  },
  reportDate: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 10,
  },
  brandName: {
    fontSize: 14,
    color: "#0A2463",
    marginTop: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A2463",
    marginBottom: 12,
    borderBottom: "2 solid #3BCEAC",
    paddingBottom: 5,
  },
  summaryGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  summaryItem: {
    width: "48%",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#F5F5F5",
    marginRight: "2%",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0A2463",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    marginTop: 10,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1 solid #E5E5E5",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#0A2463",
    color: "#FFFFFF",
    fontWeight: "bold",
    paddingVertical: 8,
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
  },
  colType: {
    width: "15%",
  },
  colName: {
    width: "25%",
  },
  colIssuingBody: {
    width: "20%",
  },
  colIssueDate: {
    width: "12%",
  },
  colExpiryDate: {
    width: "12%",
  },
  colStatus: {
    width: "16%",
  },
  statusBadge: {
    padding: 3,
    borderRadius: 3,
    textAlign: "center",
    fontSize: 8,
    fontWeight: "bold",
  },
  statusValid: {
    backgroundColor: "#D4EDDA",
    color: "#155724",
  },
  statusExpiring: {
    backgroundColor: "#FFF3CD",
    color: "#856404",
  },
  statusExpired: {
    backgroundColor: "#F8D7DA",
    color: "#721C24",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
    borderTop: "1 solid #E5E5E5",
    paddingTop: 10,
  },
  complianceScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3BCEAC",
    textAlign: "center",
    marginTop: 10,
  },
});

interface ComplianceReportProps {
  supplier: {
    id: string;
    name: string;
    country: string;
    supplier_type: string;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    brand: {
      company_name: string;
    };
  };
  certifications: Array<{
    id: string;
    certification_type: CertificationType;
    certification_name: string;
    issuing_body: string;
    issue_date: Date;
    expiry_date: Date;
    status: CertificationStatus;
  }>;
  reportDate: Date;
}

const getStatusStyle = (status: CertificationStatus) => {
  switch (status) {
    case "VALID":
      return styles.statusValid;
    case "EXPIRING_SOON":
      return styles.statusExpiring;
    case "EXPIRED":
      return styles.statusExpired;
    default:
      return styles.statusValid;
  }
};

const getStatusLabel = (status: CertificationStatus) => {
  switch (status) {
    case "VALID":
      return "Valid";
    case "EXPIRING_SOON":
      return "Expiring Soon";
    case "EXPIRED":
      return "Expired";
    default:
      return "Valid";
  }
};

export function ComplianceReportPDF({
  supplier,
  certifications,
  reportDate,
}: ComplianceReportProps) {
  const validCount = certifications.filter((c) => c.status === "VALID").length;
  const expiringCount = certifications.filter(
    (c) => c.status === "EXPIRING_SOON"
  ).length;
  const expiredCount = certifications.filter(
    (c) => c.status === "EXPIRED"
  ).length;
  const totalCount = certifications.length;
  const complianceScore =
    totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 0;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.logo}>SupplyVault</Text>
          <Text style={styles.title}>Supplier Compliance Report</Text>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <Text style={styles.reportDate}>
            Generated on: {format(reportDate, "MMMM d, yyyy 'at' h:mm a")}
          </Text>
          <Text style={styles.brandName}>{supplier.brand.company_name}</Text>
        </View>
      </Page>

      {/* Summary Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Supplier Name</Text>
              <Text style={styles.summaryValue}>{supplier.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Country</Text>
              <Text style={styles.summaryValue}>{supplier.country}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Supplier Type</Text>
              <Text style={styles.summaryValue}>
                {supplier.supplier_type.replace(/_/g, " ")}
              </Text>
            </View>
            {supplier.contact_email && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Contact Email</Text>
                <Text style={styles.summaryValue}>
                  {supplier.contact_email}
                </Text>
              </View>
            )}
            {supplier.contact_phone && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Contact Phone</Text>
                <Text style={styles.summaryValue}>
                  {supplier.contact_phone}
                </Text>
              </View>
            )}
            {supplier.address && (
              <View style={[styles.summaryItem, { width: "100%" }]}>
                <Text style={styles.summaryLabel}>Address</Text>
                <Text style={styles.summaryValue}>{supplier.address}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certification Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Certifications</Text>
              <Text style={styles.summaryValue}>{totalCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valid Certifications</Text>
              <Text style={[styles.summaryValue, { color: "#155724" }]}>
                {validCount}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expiring Soon</Text>
              <Text style={[styles.summaryValue, { color: "#856404" }]}>
                {expiringCount}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expired</Text>
              <Text style={[styles.summaryValue, { color: "#721C24" }]}>
                {expiredCount}
              </Text>
            </View>
          </View>
          <Text style={styles.complianceScore}>
            Compliance Score: {complianceScore}%
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Generated by SupplyVault • {format(reportDate, "PPP")}</Text>
        </View>
      </Page>

      {/* Certification Details Page(s) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certification Details</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.colType]}>Type</Text>
              <Text style={[styles.tableCell, styles.colName]}>Name</Text>
              <Text style={[styles.tableCell, styles.colIssuingBody]}>
                Issuing Body
              </Text>
              <Text style={[styles.tableCell, styles.colIssueDate]}>
                Issue Date
              </Text>
              <Text style={[styles.tableCell, styles.colExpiryDate]}>
                Expiry Date
              </Text>
              <Text style={[styles.tableCell, styles.colStatus]}>Status</Text>
            </View>

            {/* Table Rows */}
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colType]}>
                  {cert.certification_type.replace(/_/g, " ")}
                </Text>
                <Text style={[styles.tableCell, styles.colName]}>
                  {cert.certification_name}
                </Text>
                <Text style={[styles.tableCell, styles.colIssuingBody]}>
                  {cert.issuing_body}
                </Text>
                <Text style={[styles.tableCell, styles.colIssueDate]}>
                  {format(new Date(cert.issue_date), "MMM d, yyyy")}
                </Text>
                <Text style={[styles.tableCell, styles.colExpiryDate]}>
                  {format(new Date(cert.expiry_date), "MMM d, yyyy")}
                </Text>
                <View style={[styles.tableCell, styles.colStatus]}>
                  <Text
                    style={[styles.statusBadge, getStatusStyle(cert.status)]}
                  >
                    {getStatusLabel(cert.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Generated by SupplyVault • {format(reportDate, "PPP")} • Page 3
          </Text>
        </View>
      </Page>
    </Document>
  );
}
