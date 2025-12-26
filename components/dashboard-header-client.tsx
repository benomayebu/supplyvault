"use client";

import { Header } from "./ui/header";
import { useDashboard } from "./dashboard-layout-wrapper";

interface DashboardHeaderClientProps {
  unreadCount: number;
}

export function DashboardHeaderClient({
  unreadCount,
}: DashboardHeaderClientProps) {
  const { openSidebar } = useDashboard();
  return <Header onMenuClick={openSidebar} unreadCount={unreadCount} />;
}
