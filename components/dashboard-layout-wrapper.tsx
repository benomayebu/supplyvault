"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "./ui/sidebar";

interface DashboardContextType {
  openSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardLayoutWrapper");
  }
  return context;
}

export function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardContext.Provider
      value={{ openSidebar: () => setSidebarOpen(true) }}
    >
      <div className="min-h-screen bg-background-light">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {children}
      </div>
    </DashboardContext.Provider>
  );
}
