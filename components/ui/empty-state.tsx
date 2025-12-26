import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex min-h-[400px] flex-col items-center justify-center p-12 text-center",
        className
      )}
    >
      {illustration ? (
        illustration
      ) : Icon ? (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      ) : null}

      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-gray-600">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

// Pre-built empty states for common use cases

interface EmptyStateWithActionProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: LucideIcon;
}

export function EmptyStateWithAction({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: EmptyStateWithActionProps) {
  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      action={
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
        >
          {actionLabel}
        </button>
      }
    />
  );
}

export function EmptySuppliers() {
  return (
    <EmptyState
      title="No suppliers yet"
      description="Start building your supplier network by adding your first supplier. Track certifications, monitor compliance, and stay organized."
      action={
        <a
          href="/dashboard/suppliers?add=true"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
        >
          Add Your First Supplier
        </a>
      }
    />
  );
}

export function EmptyCertifications() {
  return (
    <EmptyState
      title="No certifications yet"
      description="Upload certification documents for your suppliers to track expiry dates, compliance status, and receive alerts."
      action={
        <a
          href="/dashboard/suppliers"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
        >
          Upload Certification
        </a>
      }
    />
  );
}

export function EmptyAlerts() {
  return (
    <EmptyState
      title="No alerts"
      description="You're all caught up! No certification expiry alerts at the moment."
    />
  );
}

export function EmptySearchResults({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      title="No results found"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try adjusting your search or filters.`
          : "No items match your current filters. Try adjusting your search criteria."
      }
    />
  );
}
