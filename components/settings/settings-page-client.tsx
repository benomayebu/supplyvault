"use client";

import { useState } from "react";
import { SettingsTabs } from "./settings-tabs";
import { BrandProfile } from "./brand-profile";
import { TeamMembers } from "./team-members";
import { Notifications } from "./notifications";
import { Billing } from "./billing";
import { SubscriptionTier, UserRole } from "@prisma/client";

interface SettingsPageClientProps {
  brand: {
    id: string;
    company_name: string;
    email: string;
    country: string | null;
    subscription_tier: SubscriptionTier;
  };
  teamMembers: Array<{
    id: string;
    clerk_user_id: string;
    email: string;
    full_name: string;
    role: UserRole;
    created_at: Date;
  }>;
  currentUserRole: UserRole;
  currentUserId: string;
  usageMetrics: {
    supplierCount: number;
    certificationCount: number;
  };
  notificationPreferences: {
    emailAlertsEnabled: boolean;
    alertTypes: {
      ninetyDay: boolean;
      thirtyDay: boolean;
      sevenDay: boolean;
      expired: boolean;
    };
    alertFrequency: "realtime" | "daily";
    inAppNotificationsEnabled: boolean;
  };
}

export function SettingsPageClient({
  brand,
  teamMembers,
  currentUserRole,
  currentUserId,
  usageMetrics,
  notificationPreferences,
}: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-navy">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "profile" && <BrandProfile initialBrand={brand} />}
        {activeTab === "team" && (
          <TeamMembers
            initialMembers={teamMembers}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
          />
        )}
        {activeTab === "notifications" && (
          <Notifications initialPreferences={notificationPreferences} />
        )}
        {activeTab === "billing" && (
          <Billing
            subscriptionTier={brand.subscription_tier}
            usageMetrics={usageMetrics}
          />
        )}
      </div>
    </div>
  );
}
