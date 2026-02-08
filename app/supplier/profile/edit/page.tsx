import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getStakeholderRole, getCurrentSupplier } from "@/lib/auth";
import EditProfileClient from "@/components/supplier/edit-profile-client";

export default async function EditProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify user is a supplier
  const role = await getStakeholderRole();
  if (role !== "SUPPLIER") {
    redirect("/brand/dashboard");
  }

  const supplier = await getCurrentSupplier();
  if (!supplier) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-navy py-6 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="mt-2 text-white/80">Update your supplier information</p>
        </div>
      </div>

      <EditProfileClient supplier={supplier} />
    </div>
  );
}
