import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has a brand profile in the database (source of truth)
  const brand = await prisma.brand.findUnique({
    where: { clerk_user_id: userId },
    select: { id: true },
  });

  if (!brand) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
