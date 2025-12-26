"use client";

import { Building2, Users, Bell, CreditCard } from "lucide-react";
import { clsx } from "clsx";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: "profile", label: "Brand Profile", icon: Building2 },
  { id: "team", label: "Team Members", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                activeTab === tab.id
                  ? "border-secondary-teal text-secondary-teal"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <Icon
                className={clsx(
                  "h-5 w-5",
                  activeTab === tab.id
                    ? "text-secondary-teal"
                    : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
