import { redirect } from "next/navigation";
import { getCurrentBrand, getCurrentUserRecord } from "@/lib/auth";
import { getTeamMembers, getBrandUsageMetrics } from "@/lib/settings";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { clerkClient } from "@clerk/nextjs/server";

export const revalidate = 60; // Cache for 1 minute

export default async function SettingsPage() {
  const brand = await getCurrentBrand();
  const userRecord = await getCurrentUserRecord();

  if (!brand || !userRecord) {
    redirect("/dashboard/onboarding");
  }

  // Fetch team members
  const teamMembers = await getTeamMembers(brand.id);

  // Fetch usage metrics
  const usageMetrics = await getBrandUsageMetrics(brand.id);

  // Get notification preferences from Clerk
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(brand.clerk_user_id);
  const notificationPreferences =
    (user.publicMetadata?.notificationPreferences as {
      emailAlertsEnabled?: boolean;
      alertTypes?: {
        ninetyDay: boolean;
        thirtyDay: boolean;
        sevenDay: boolean;
        expired: boolean;
      };
      alertFrequency?: "realtime" | "daily";
      inAppNotificationsEnabled?: boolean;
    }) || null;

  const defaultPreferences = {
    emailAlertsEnabled: true,
    alertTypes: {
      ninetyDay: true,
      thirtyDay: true,
      sevenDay: true,
      expired: true,
    },
    alertFrequency: "realtime" as const,
    inAppNotificationsEnabled: true,
  };

  const mergedPreferences = notificationPreferences
    ? {
        emailAlertsEnabled:
          notificationPreferences.emailAlertsEnabled ??
          defaultPreferences.emailAlertsEnabled,
        alertTypes: {
          ninetyDay:
            notificationPreferences.alertTypes?.ninetyDay ??
            defaultPreferences.alertTypes.ninetyDay,
          thirtyDay:
            notificationPreferences.alertTypes?.thirtyDay ??
            defaultPreferences.alertTypes.thirtyDay,
          sevenDay:
            notificationPreferences.alertTypes?.sevenDay ??
            defaultPreferences.alertTypes.sevenDay,
          expired:
            notificationPreferences.alertTypes?.expired ??
            defaultPreferences.alertTypes.expired,
        },
        alertFrequency:
          notificationPreferences.alertFrequency ??
          defaultPreferences.alertFrequency,
        inAppNotificationsEnabled:
          notificationPreferences.inAppNotificationsEnabled ??
          defaultPreferences.inAppNotificationsEnabled,
      }
    : defaultPreferences;

  return (
    <SettingsPageClient
      brand={brand}
      teamMembers={teamMembers}
      currentUserRole={userRecord.role}
      currentUserId={userRecord.id}
      usageMetrics={usageMetrics}
      notificationPreferences={mergedPreferences}
    />
  );
}
