import { prisma } from "./db";
import { UserRole } from "@prisma/client";

/**
 * Get all team members (users) for a brand
 */
export async function getTeamMembers(brandId: string) {
  try {
    return await prisma.user.findMany({
      where: {
        brand_id: brandId,
      },
      select: {
        id: true,
        clerk_user_id: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw new Error("Failed to fetch team members");
  }
}

/**
 * Get brand usage metrics
 */
export async function getBrandUsageMetrics(brandId: string) {
  try {
    const [supplierCount, certificationCount] = await Promise.all([
      prisma.supplier.count({
        where: { brand_id: brandId },
      }),
      prisma.certification.count({
        where: {
          supplier: {
            brand_id: brandId,
          },
        },
      }),
    ]);

    return {
      supplierCount,
      certificationCount,
    };
  } catch (error) {
    console.error("Error fetching brand usage metrics:", error);
    throw new Error("Failed to fetch usage metrics");
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
  brandId: string
) {
  try {
    // Verify user belongs to brand
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        brand_id: brandId,
      },
    });

    if (!user) {
      throw new Error("User not found or doesn't belong to brand");
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

/**
 * Remove user from brand
 */
export async function removeUserFromBrand(userId: string, brandId: string) {
  try {
    // Verify user belongs to brand
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        brand_id: brandId,
      },
    });

    if (!user) {
      throw new Error("User not found or doesn't belong to brand");
    }

    // Don't allow removing the last admin
    const adminCount = await prisma.user.count({
      where: {
        brand_id: brandId,
        role: UserRole.ADMIN,
      },
    });

    if (user.role === UserRole.ADMIN && adminCount === 1) {
      throw new Error("Cannot remove the last admin");
    }

    return await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    console.error("Error removing user:", error);
    throw error;
  }
}
