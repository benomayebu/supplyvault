import { getCurrentBrand } from "@/lib/auth";
import { getAlertsByBrand } from "@/lib/db";
import { AlertsPageClient } from "@/components/alerts/alerts-page-client";
import { redirect } from "next/navigation";

export const revalidate = 60; // Cache for 1 minute

export default async function AlertsPage() {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  // Fetch all alerts for the brand with pagination
  const alerts = await getAlertsByBrand(brand.id, {
    take: 500, // Reasonable limit for alerts
  });

  // Get unique suppliers for filter
  const suppliers = Array.from(
    new Set(alerts.map((alert) => alert.certification.supplier.name))
  ).sort();

  // Calculate unread count
  const unreadCount = alerts.filter((alert) => !alert.is_read).length;

  return (
    <AlertsPageClient
      initialAlerts={alerts}
      initialUnreadCount={unreadCount}
      suppliers={suppliers}
    />
  );
}
