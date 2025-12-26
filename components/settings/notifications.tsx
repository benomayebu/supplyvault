"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Mail } from "lucide-react";

interface NotificationPreferences {
  emailAlertsEnabled: boolean;
  alertTypes: {
    ninetyDay: boolean;
    thirtyDay: boolean;
    sevenDay: boolean;
    expired: boolean;
  };
  alertFrequency: "realtime" | "daily";
  inAppNotificationsEnabled: boolean;
}

interface NotificationsProps {
  initialPreferences: NotificationPreferences;
}

export function Notifications({ initialPreferences }: NotificationsProps) {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(initialPreferences);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preferences"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-navy">
          Notification Preferences
        </h2>
        <p className="mt-1 text-gray-600">
          Configure how and when you receive alerts and notifications
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Notification preferences updated successfully!
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Email Alerts */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary-navy" />
            <h3 className="text-lg font-semibold text-primary-navy">
              Email Alerts
            </h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.emailAlertsEnabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    emailAlertsEnabled: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 text-secondary-teal focus:ring-secondary-teal"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable email alerts for expiring certifications
              </span>
            </label>

            {preferences.emailAlertsEnabled && (
              <div className="ml-7 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Receive alerts for:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.alertTypes.ninetyDay}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          alertTypes: {
                            ...preferences.alertTypes,
                            ninetyDay: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-secondary-teal focus:ring-secondary-teal"
                    />
                    <span className="text-sm text-gray-700">
                      90 days before expiry
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.alertTypes.thirtyDay}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          alertTypes: {
                            ...preferences.alertTypes,
                            thirtyDay: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-secondary-teal focus:ring-secondary-teal"
                    />
                    <span className="text-sm text-gray-700">
                      30 days before expiry
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.alertTypes.sevenDay}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          alertTypes: {
                            ...preferences.alertTypes,
                            sevenDay: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-secondary-teal focus:ring-secondary-teal"
                    />
                    <span className="text-sm text-gray-700">
                      7 days before expiry
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.alertTypes.expired}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          alertTypes: {
                            ...preferences.alertTypes,
                            expired: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-secondary-teal focus:ring-secondary-teal"
                    />
                    <span className="text-sm text-gray-700">
                      On expiry date
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Alert Frequency
                  </label>
                  <select
                    value={preferences.alertFrequency}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        alertFrequency: e.target.value as "realtime" | "daily",
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
                  >
                    <option value="realtime">Real-time (immediate)</option>
                    <option value="daily">Daily digest</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary-navy" />
            <h3 className="text-lg font-semibold text-primary-navy">
              In-App Notifications
            </h3>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.inAppNotificationsEnabled}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  inAppNotificationsEnabled: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-secondary-teal focus:ring-secondary-teal"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable in-app notifications
            </span>
          </label>
          <p className="ml-7 mt-1 text-xs text-gray-500">
            Show notification badges and alerts within the application
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
