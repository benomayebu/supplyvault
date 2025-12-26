"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertType } from "@prisma/client";
import { AlertCard } from "./alert-card";
import { AlertFilters } from "./alert-filters";
import { AlertStats } from "./alert-stats";
import { differenceInDays } from "date-fns";
import { CheckSquare, Square, Trash2 } from "lucide-react";
import { EmptySearchResults, EmptyAlerts } from "@/components/ui/empty-state";

interface Alert {
  id: string;
  alert_type: AlertType;
  sent_at: Date | null;
  is_read: boolean;
  created_at: Date;
  certification: {
    id: string;
    certification_name: string;
    certification_type: string;
    expiry_date: Date;
    supplier: {
      id: string;
      name: string;
    };
  };
}

interface AlertsPageClientProps {
  initialAlerts: Alert[];
  initialUnreadCount: number;
  suppliers: string[];
}

export function AlertsPageClient({ initialAlerts }: AlertsPageClientProps) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [alertType, setAlertType] = useState<AlertType | "ALL">("ALL");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter((alert) => {
      if (showUnreadOnly && alert.is_read) return false;
      if (alertType !== "ALL" && alert.alert_type !== alertType) return false;
      if (
        supplierSearch &&
        !alert.certification.supplier.name
          .toLowerCase()
          .includes(supplierSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.sent_at
        ? new Date(a.sent_at).getTime()
        : a.created_at.getTime();
      const dateB = b.sent_at
        ? new Date(b.sent_at).getTime()
        : b.created_at.getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Calculate stats
  const stats = {
    totalUnread: alerts.filter((a) => !a.is_read).length,
    critical: alerts.filter((a) => {
      if (a.is_read) return false;
      const days = differenceInDays(
        new Date(a.certification.expiry_date),
        new Date()
      );
      return days >= 0 && days < 7;
    }).length,
    warning: alerts.filter((a) => {
      if (a.is_read) return false;
      const days = differenceInDays(
        new Date(a.certification.expiry_date),
        new Date()
      );
      return days >= 7 && days <= 30;
    }).length,
    info: alerts.filter((a) => {
      if (a.is_read) return false;
      const days = differenceInDays(
        new Date(a.certification.expiry_date),
        new Date()
      );
      return days > 30;
    }).length,
  };

  // Poll for new alerts every 60 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/alerts?poll=true");
        if (response.ok) {
          const data = await response.json();
          const newAlerts = data.alerts || [];
          const previousUnreadCount = alerts.filter((a) => !a.is_read).length;
          const currentUnreadCount = newAlerts.filter(
            (a: Alert) => !a.is_read
          ).length;

          if (currentUnreadCount > previousUnreadCount) {
            // New alerts arrived - show toast (you'd integrate with a toast library)
            console.log("New alerts received");
          }

          setAlerts(newAlerts);
        }
      } catch (error) {
        console.error("Error polling for alerts:", error);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(pollInterval);
  }, [alerts]);

  // Mark alert as read (optimistic update)
  const handleMarkAsRead = useCallback(
    async (alertId: string) => {
      // Optimistic update
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );

      try {
        const response = await fetch(`/api/alerts/${alertId}/read`, {
          method: "POST",
        });

        if (!response.ok) {
          // Revert on error
          router.refresh();
        }
      } catch (error) {
        console.error("Error marking alert as read:", error);
        router.refresh();
      }
    },
    [router]
  );

  // Bulk mark as read
  const handleBulkMarkAsRead = async () => {
    if (selectedAlerts.size === 0) return;

    const alertIds = Array.from(selectedAlerts);

    // Optimistic update
    setAlerts((prev) =>
      prev.map((alert) =>
        selectedAlerts.has(alert.id) ? { ...alert, is_read: true } : alert
      )
    );
    setSelectedAlerts(new Set());

    try {
      const response = await fetch("/api/alerts/bulk-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertIds }),
      });

      if (!response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error marking alerts as read:", error);
      router.refresh();
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedAlerts.size === 0) return;

    if (!confirm(`Delete ${selectedAlerts.size} selected alert(s)?`)) {
      return;
    }

    const alertIds = Array.from(selectedAlerts);

    // Optimistic update
    setAlerts((prev) => prev.filter((alert) => !selectedAlerts.has(alert.id)));
    setSelectedAlerts(new Set());

    try {
      const response = await fetch("/api/alerts/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertIds }),
      });

      if (!response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting alerts:", error);
      router.refresh();
    }
  };

  const toggleSelect = (alertId: string) => {
    setSelectedAlerts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map((a) => a.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-navy">Alerts</h1>
        <p className="mt-2 text-gray-600">
          Monitor certification expiry alerts and notifications
        </p>
      </div>

      {/* Stats */}
      <AlertStats {...stats} />

      {/* Filters */}
      <AlertFilters
        showUnreadOnly={showUnreadOnly}
        onShowUnreadOnlyChange={setShowUnreadOnly}
        alertType={alertType}
        onAlertTypeChange={setAlertType}
        supplierSearch={supplierSearch}
        onSupplierSearchChange={setSupplierSearch}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {/* Bulk Actions */}
      {selectedAlerts.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedAlerts.size} alert(s) selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleBulkMarkAsRead}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Mark as read
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 && (
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={toggleSelectAll}
              className="text-gray-500 hover:text-gray-700"
            >
              {selectedAlerts.size === filteredAlerts.length ? (
                <CheckSquare className="h-5 w-5" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </button>
            <span className="text-sm text-gray-600">
              {filteredAlerts.length} alert(s)
            </span>
          </div>
        )}

        {filteredAlerts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white">
            {alerts.length === 0 ? (
              <EmptyAlerts />
            ) : (
              <EmptySearchResults searchTerm={supplierSearch} />
            )}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(alert.id);
                }}
                className="mt-4 text-gray-400 hover:text-gray-600"
              >
                {selectedAlerts.has(alert.id) ? (
                  <CheckSquare className="h-5 w-5 text-secondary-teal" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1">
                <AlertCard alert={alert} onMarkAsRead={handleMarkAsRead} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
