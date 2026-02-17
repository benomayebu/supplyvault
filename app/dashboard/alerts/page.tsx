import { getCurrentBrand } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default async function AlertsPage() {
  const brand = await getCurrentBrand();

  if (!brand) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <NotificationCenter />
    </div>
  );
}
