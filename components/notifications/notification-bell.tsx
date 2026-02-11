"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const response = await fetch("/api/alerts");
      if (response.ok) {
        const data = await response.json();
        const unread =
          data.alerts?.filter((a: { is_read: boolean }) => !a.is_read).length ||
          0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }

  return (
    <Link
      href="/dashboard/alerts"
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
