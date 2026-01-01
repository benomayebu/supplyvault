import { getCurrentUser, getCurrentBrand, getCurrentUserRecord } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if brand and user records already exist
  const existingBrand = await getCurrentBrand();
  const existingUserRecord = await getCurrentUserRecord();

  // If both records exist, redirect to settings
  if (existingBrand && existingUserRecord) {
    redirect("/dashboard/settings");
  }

  // Auto-create brand record if it doesn't exist
  let brand = existingBrand;
  if (!brand) {
    try {
      brand = await prisma.brand.create({
        data: {
          clerk_user_id: user.id,
          company_name: user.fullName || "My Company",
          email: user.emailAddresses[0]?.emailAddress || "",
          subscription_tier: "FREE",
        },
      });
      console.log("Created brand record for user:", user.id);
    } catch (error) {
      console.error("Error creating brand:", error);
      // If brand creation fails, show error message
      return (
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-red-600">Setup Error</h1>
          <p className="mt-4 text-lg text-gray-600">
            There was an error setting up your account. Please try refreshing the page.
          </p>
        </div>
      );
    }
  }

  // Auto-create user record if it doesn't exist
  if (!existingUserRecord && brand) {
    try {
      await prisma.user.create({
        data: {
          clerk_user_id: user.id,
          brand_id: brand.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          full_name: user.fullName || "User",
          role: "ADMIN", // First user is always admin
        },
      });
      console.log("Created user record for user:", user.id);
    } catch (error) {
      console.error("Error creating user:", error);
      // If user creation fails, show error message
      return (
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-red-600">Setup Error</h1>
          <p className="mt-4 text-lg text-gray-600">
            There was an error setting up your account. Please try refreshing the page.
          </p>
        </div>
      );
    }
  }

  // After creating records, redirect to settings
  redirect("/dashboard/settings");
}
