export function SidebarSkeleton() {
  return (
    <div className="fixed left-0 top-0 z-50 h-full w-60 animate-pulse bg-primary-navy">
      <div className="flex h-full flex-col">
        <div className="h-16 border-b border-primary-navy/20">
          <div className="h-8 w-32 bg-white/10 m-4 rounded" />
        </div>
        <div className="flex-1 space-y-2 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse hidden lg:block" />
        <div className="flex-1 max-w-md h-10 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-4">
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="space-y-3 p-4">
        {/* Header */}
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 flex-1 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-4 flex-1 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
