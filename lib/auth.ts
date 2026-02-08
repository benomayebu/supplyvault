import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { UserRole } from "@prisma/client";

/**
 * Get the current authenticated Clerk user
 */
export async function getCurrentUser() {
  try {
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get the stakeholder role from Clerk metadata
 */
export async function getStakeholderRole(): Promise<"SUPPLIER" | "BRAND" | null> {
  try {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.unsafeMetadata as { stakeholderRole?: string } | undefined;
    const role = metadata?.stakeholderRole;
    
    if (role === "SUPPLIER" || role === "BRAND") {
      return role;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting stakeholder role:", error);
    return null;
  }
}

/**
 * Get the supplier associated with the current user
 */
export async function getCurrentSupplier() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        clerk_user_id: user.id,
      },
    });

    return supplier;
  } catch (error) {
    console.error("Error getting current supplier:", error);
    return null;
  }
}

/**
 * Get the brand associated with the current user
 */
export async function getCurrentBrand() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const brand = await prisma.brand.findUnique({
      where: {
        clerk_user_id: user.id,
      },
      select: {
        id: true,
        clerk_user_id: true,
        company_name: true,
        email: true,
        country: true,
        subscription_tier: true,
      },
    });

    return brand;
  } catch (error) {
    console.error("Error getting current brand:", error);
    return null;
  }
}

/**
 * Get the user record (team member) associated with the current Clerk user
 */
export async function getCurrentUserRecord() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const userRecord = await prisma.user.findUnique({
      where: {
        clerk_user_id: user.id,
      },
      include: {
        brand: {
          select: {
            id: true,
            company_name: true,
            subscription_tier: true,
          },
        },
      },
    });

    return userRecord;
  } catch (error) {
    console.error("Error getting current user record:", error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: Authentication required");
  }

  return userId;
}

/**
 * Require a specific role - throws error if user doesn't have the role
 */
export async function requireRole(requiredRole: UserRole) {
  const userRecord = await getCurrentUserRecord();

  if (!userRecord) {
    throw new Error("Unauthorized: User not found");
  }

  // Role hierarchy: ADMIN > EDITOR > VIEWER
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    EDITOR: 2,
    ADMIN: 3,
  };

  const userRoleLevel = roleHierarchy[userRecord.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error(
      `Forbidden: Requires ${requiredRole} role, but user has ${userRecord.role} role`
    );
  }

  return userRecord;
}

/**
 * Check if current user has at least the required role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  try {
    await requireRole(requiredRole);
    return true;
  } catch {
    return false;
  }
}
