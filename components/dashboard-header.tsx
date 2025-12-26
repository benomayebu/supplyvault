import { Suspense } from "react";
import { HeaderSkeleton } from "./ui/loading";
import { getCurrentBrand } from "@/lib/auth";
import { getUnreadAlertCount } from "@/lib/db";
import { DashboardHeaderClient } from "./dashboard-header-client";

async function UnreadAlertCount() {
  try {
    const brand = await getCurrentBrand();
    if (!brand) return 0;
    return await getUnreadAlertCount(brand.id);
  } catch (error) {
    console.error("Error fetching unread alert count:", error);
    return 0;
  }
}

async function HeaderWithCount() {
  const unreadCount = await UnreadAlertCount();
  return <DashboardHeaderClient unreadCount={unreadCount} />;
}

export function DashboardHeader() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderWithCount />
    </Suspense>
  );
}
