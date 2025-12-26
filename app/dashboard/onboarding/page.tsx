import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-primary-navy">
        Welcome to SupplyVault!
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Let&apos;s get your account set up. Complete your company profile to get
        started.
      </p>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-primary-navy">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-gray-600">
          Add your company details to start managing your supply chain
          certifications.
        </p>
        <Link
          href="/dashboard/settings"
          className="mt-4 inline-block rounded-md bg-primary-navy px-4 py-2 text-white hover:bg-primary-navy/90"
        >
          Complete Setup
        </Link>
      </div>
    </div>
  );
}
