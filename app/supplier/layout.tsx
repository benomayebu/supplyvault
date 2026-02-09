import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has a supplier profile in the database (source of truth)
  const supplier = await prisma.supplier.findUnique({
    where: { clerk_user_id: userId },
    select: { id: true },
  });

  if (!supplier) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
