"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Upload, Bell, X } from "lucide-react";
import Link from "next/link";

interface CertActionsProps {
  certificationId: string;
  supplierId: string;
  onDelete: () => void;
}

export function CertActions({
  certificationId,
  supplierId,
  onDelete,
}: CertActionsProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/certifications/${certificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete certification");
      }

      onDelete();
      router.push(`/dashboard/suppliers/${supplierId}`);
    } catch (error) {
      console.error("Error deleting certification:", error);
      alert("Failed to delete certification. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/certifications/${certificationId}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Edit className="h-4 w-4" />
          Edit Certification
        </Link>

        <Link
          href={`/dashboard/certifications/${certificationId}/replace`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Upload className="h-4 w-4" />
          Replace Document
        </Link>

        <Link
          href={`/dashboard/certifications/${certificationId}/reminder`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Bell className="h-4 w-4" />
          Set Reminder
        </Link>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-900">
              Delete Certification
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this certification? This action
              cannot be undone and will also delete all associated alerts.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
