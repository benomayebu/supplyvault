import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({
  className,
  variant = "rectangular",
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200";
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      aria-hidden="true"
    />
  );
}

// Pre-built skeleton components for common use cases

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <Skeleton className="h-4 w-1/4 mb-4" variant="text" />
      <Skeleton className="h-8 w-1/2 mb-2" variant="text" />
      <Skeleton className="h-4 w-full" variant="text" />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" variant="text" />
        <Skeleton className="h-5 w-5 rounded" variant="circular" />
      </div>
      <Skeleton className="h-10 w-32 mb-2" variant="text" />
      <Skeleton className="h-4 w-20" variant="text" />
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" variant="text" />
          ))}
        </div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className="h-4 flex-1"
                  variant="text"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" variant="text" />
        </td>
      ))}
    </tr>
  );
}

export function SupplierCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" variant="text" />
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" variant="rectangular" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
      </div>
    </div>
  );
}

export function CertificationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Skeleton className="h-8 w-64 mb-4" variant="text" />
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-6 w-24 rounded-full" variant="rectangular" />
          <Skeleton className="h-6 w-32 rounded-full" variant="rectangular" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-full" variant="text" />
        </div>
      </div>

      {/* Document Viewer */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Skeleton className="h-96 w-full" variant="rectangular" />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" variant="rectangular" />
        <Skeleton className="h-10 w-32" variant="rectangular" />
        <Skeleton className="h-10 w-32" variant="rectangular" />
      </div>
    </div>
  );
}

export function SupplierDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" variant="text" />
          <Skeleton className="h-4 w-64" variant="text" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" variant="rectangular" />
          <Skeleton className="h-10 w-32" variant="rectangular" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Certifications Table */}
      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Expiry Table */}
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}

export function AlertCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" variant="rectangular" />
            <Skeleton className="h-2 w-2 rounded-full" variant="circular" />
          </div>
          <div>
            <Skeleton className="h-5 w-48 mb-2" variant="text" />
            <Skeleton className="h-4 w-32" variant="text" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" variant="text" />
            <Skeleton className="h-4 w-20" variant="text" />
          </div>
        </div>
        <Skeleton className="h-5 w-5" variant="circular" />
      </div>
    </div>
  );
}
