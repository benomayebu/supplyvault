"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronDown } from "lucide-react";
import { VerificationStatus } from "./verification-badge";

interface VerificationActionsProps {
  supplierId: string;
  currentStatus: VerificationStatus;
  className?: string;
}

export function VerificationActions({
  supplierId,
  currentStatus,
  className = "",
}: VerificationActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const statusOptions: {
    value: VerificationStatus;
    label: string;
    description: string;
  }[] = [
    {
      value: "UNVERIFIED",
      label: "Unverified",
      description: "Profile incomplete or not verified",
    },
    {
      value: "BASIC",
      label: "Basic",
      description: "Profile complete with certifications",
    },
    {
      value: "VERIFIED",
      label: "Verified",
      description: "Verified by brand admin",
    },
  ];

  const handleStatusChange = async (newStatus: VerificationStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/suppliers/${supplierId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update verification status");
      }

      // Refresh the page to show updated data
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating verification status:", error);
      alert("Failed to update verification status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Shield className="h-4 w-4" />
        <span>Change Verification</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={isUpdating}
                  className={`w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                    option.value === currentStatus
                      ? "bg-gray-50 font-semibold"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    {option.value === currentStatus && (
                      <span className="text-xs text-secondary-teal">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
