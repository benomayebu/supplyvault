"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  alert_type: string;
  is_read: boolean;
  created_at: string;
  sent_at: string | null;
  certification: {
    id: string;
    certification_type: string;
    certification_name: string;
    expiry_date: string;
  };
}

export function NotificationCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAlerts() {
    try {
      const response = await fetch("/api/alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(alertId: string) {
    try {
      const response = await fetch(`/api/alerts/${alertId}/read`, {
        method: "PATCH",
      });
      if (response.ok) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, is_read: true } : alert
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/alerts/bulk-read", {
        method: "PATCH",
      });
      if (response.ok) {
        setAlerts((prev) => prev.map((alert) => ({ ...alert, is_read: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  async function deleteAlert(alertId: string) {
    try {
      const response = await fetch(`/api/alerts/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertIds: [alertId] }),
      });
      if (response.ok) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      }
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "unread") return !alert.is_read;
    if (filter === "read") return alert.is_read;
    return true;
  });

  const unreadCount = alerts.filter((alert) => !alert.is_read).length;

  function getAlertIcon() {
    return <Bell className="h-5 w-5 text-orange-500" />;
  }

  function getAlertMessage(alert: Alert) {
    const cert = alert.certification;
    const daysUntilExpiry = Math.ceil(
      (new Date(cert.expiry_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    switch (alert.alert_type) {
      case "EXPIRING_SOON":
        return `Certificate "${cert.certification_name}" (${cert.certification_type}) expires in ${daysUntilExpiry} days`;
      case "EXPIRED":
        return `Certificate "${cert.certification_name}" (${cert.certification_type}) has expired`;
      case "EXPIRING_30":
        return `Certificate "${cert.certification_name}" (${cert.certification_type}) expires in 30 days`;
      case "EXPIRING_60":
        return `Certificate "${cert.certification_name}" (${cert.certification_type}) expires in 60 days`;
      case "EXPIRING_90":
        return `Certificate "${cert.certification_name}" (${cert.certification_type}) expires in 90 days`;
      default:
        return `Alert about certificate "${cert.certification_name}"`;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {alerts.length > 0 && unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {["all", "unread", "read"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as typeof filter)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === tab
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
            {tab === "unread" && unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded-lg p-4 transition-all ${
                alert.is_read
                  ? "border-gray-200 opacity-60"
                  : "border-teal-200 bg-teal-50/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getAlertIcon()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">
                    {getAlertMessage(alert)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!alert.is_read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
