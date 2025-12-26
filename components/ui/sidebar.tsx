"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Building2,
  FileCheck,
  Bell,
  Settings,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Building2 },
  {
    name: "Certifications",
    href: "/dashboard/certifications",
    icon: FileCheck,
  },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 h-full w-60 transform bg-primary-navy text-white transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between border-b border-primary-navy/20 px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xl font-bold"
              onClick={onClose}
            >
              <span className="text-secondary-teal">Supply</span>
              <span>Vault</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 space-y-1 px-3 py-4"
            aria-label="Main navigation"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary-teal text-primary-navy"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-primary-navy/20 p-4">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} SupplyVault
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
