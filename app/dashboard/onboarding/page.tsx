import { getCurrentUser, getCurrentBrand } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if brand exists (it should from webhook)
  const brand = await getCurrentBrand();
  if (!brand) {
    // Brand should exist from webhook, but if not, redirect to sign-in
    redirect("/sign-in");
  }

  // Check if user has completed onboarding
  // The webhook creates the Brand with default values when user signs up
  // The onboarding form updates the Brand (company_name, country)
  // If updated_at > created_at, it means the brand was updated by the onboarding form
  const hasCompletedOnboarding = brand.updated_at > brand.created_at;
  if (hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  const userEmail = user.emailAddresses[0]?.emailAddress || "";
  const initialCompanyName = brand?.company_name || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-navy">
          Welcome to SupplyVault!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Let&apos;s get your account set up. This will only take a minute.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-primary-navy mb-6">
          Complete Your Profile
        </h2>
        <OnboardingForm 
          userEmail={userEmail} 
          initialCompanyName={initialCompanyName}
        />
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Questions? Contact us at{" "}
          <a
            href="mailto:support@supplyvault.com"
            className="text-primary-navy hover:underline"
          >
            support@supplyvault.com
          </a>
        </p>
      </div>
    </div>
  );
}
