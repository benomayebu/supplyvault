"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Search, Bell, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  unreadCount?: number;
}

export function Header({ onMenuClick, unreadCount = 0 }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/dashboard/suppliers?search=${encodeURIComponent(searchQuery)}`
      );
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Toggle sidebar"
          aria-expanded="false"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        {/* Logo - Desktop */}
        <Link
          href="/dashboard"
          className="hidden items-center gap-2 text-2xl font-bold lg:flex"
        >
          <span className="text-secondary-teal">Supply</span>
          <span className="text-primary-navy">Vault</span>
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md"
          role="search"
          aria-label="Search suppliers"
        >
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suppliers..."
              className="w-full rounded-lg border border-gray-300 bg-background-light py-2 pl-10 pr-4 text-sm focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
              aria-label="Search suppliers"
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link
            href="/dashboard/alerts"
            className="relative p-2 text-gray-700 hover:text-primary-navy"
            aria-label={`View alerts${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-teal text-xs font-semibold text-white"
                aria-label={`${unreadCount} unread alerts`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
