import { DashboardHeader } from "@/components/dashboard-header";
import { HeaderSkeleton } from "@/components/ui/loading";
import { Suspense } from "react";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <DashboardLayoutWrapper>
        {/* Main content area */}
        <div className="lg:pl-60">
          {/* Header */}
          <Suspense fallback={<HeaderSkeleton />}>
            <HeaderWrapper />
          </Suspense>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </DashboardLayoutWrapper>
    </ErrorBoundary>
  );
}

async function HeaderWrapper() {
  return <DashboardHeader />;
}
