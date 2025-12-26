import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Show landing page for unauthenticated users
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-navy to-primary-navy/90">
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white md:text-6xl">
            SupplyVault
          </h1>
          <p className="mt-4 text-xl text-white/90 md:text-2xl">
            Supplier Compliance Management
          </p>
        </div>

        <div className="mb-12 max-w-2xl">
          <p className="text-lg text-white/80 md:text-xl">
            Manage your supplier certifications, track expiry dates, and ensure
            compliance with ease.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#3BCEAC] px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-[#3BCEAC]/90"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border-2 border-white px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">
              Track Certifications
            </h3>
            <p className="text-white/80">
              Monitor all supplier certifications in one place
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">
              Expiry Alerts
            </h3>
            <p className="text-white/80">
              Get notified before certifications expire
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">
              Compliance Reports
            </h3>
            <p className="text-white/80">
              Generate comprehensive compliance reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
