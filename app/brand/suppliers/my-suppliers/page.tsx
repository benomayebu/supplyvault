import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getStakeholderRole } from "@/lib/auth";
import MySuppliersClient from "@/components/suppliers/my-suppliers-client";

export default async function MySuppliersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify user is a brand
  const role = await getStakeholderRole();
  if (role !== "BRAND") {
    redirect("/supplier/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">My Suppliers</h1>
          <p className="mt-2 text-white/80">
            Manage your connected supplier network
          </p>
        </div>
      </div>

      <MySuppliersClient />
    </div>
  );
}
