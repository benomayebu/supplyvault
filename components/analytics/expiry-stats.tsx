import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { StatCard } from "./stat-card";

interface Certification {
  id: string;
  expiry_date: Date;
}

interface ExpiryStatsProps {
  certifications: Certification[];
}

export function ExpiryStats({ certifications }: ExpiryStatsProps) {
  const now = new Date();

  // Calculate expiry buckets
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const expiringIn7Days = certifications.filter((cert) => {
    const expiryDate = new Date(cert.expiry_date);
    return expiryDate > now && expiryDate <= sevenDaysFromNow;
  }).length;

  const expiringIn30Days = certifications.filter((cert) => {
    const expiryDate = new Date(cert.expiry_date);
    return expiryDate > now && expiryDate <= thirtyDaysFromNow;
  }).length;

  const expiringIn90Days = certifications.filter((cert) => {
    const expiryDate = new Date(cert.expiry_date);
    return expiryDate > now && expiryDate <= ninetyDaysFromNow;
  }).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Certifications"
        value={certifications.length}
        subtitle="Active certifications"
        icon={FileText}
        color="teal"
      />
      <StatCard
        title="Expiring in 7 Days"
        value={expiringIn7Days}
        subtitle="Critical - Renew now"
        icon={AlertCircle}
        color="red"
      />
      <StatCard
        title="Expiring in 30 Days"
        value={expiringIn30Days}
        subtitle="Warning - Plan renewal"
        icon={AlertTriangle}
        color="yellow"
      />
      <StatCard
        title="Expiring in 90 Days"
        value={expiringIn90Days}
        subtitle="Safe - Monitor closely"
        icon={CheckCircle}
        color="green"
      />
    </div>
  );
}
