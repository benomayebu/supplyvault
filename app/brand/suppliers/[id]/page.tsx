import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getStakeholderRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SupplierDetailViewWithConnection from "@/components/suppliers/supplier-detail-view-with-connection";

export default async function SupplierViewPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify user is a brand
  const role = await getStakeholderRole();
  if (role !== "BRAND") {
    redirect("/supplier/dashboard");
  }

  // Get supplier details
  const supplier = await prisma.supplier.findUnique({
    where: {
      id: params.id,
    },
    include: {
      certifications: {
        orderBy: { expiry_date: "desc" },
      },
    },
  });

  // Only show independent suppliers (with clerk_user_id)
  if (supplier && !supplier.clerk_user_id) {
    notFound();
  }

  if (!supplier) {
    notFound();
  }

  return <SupplierDetailViewWithConnection supplier={supplier} />;
}
