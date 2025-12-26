import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

const updateNotificationsSchema = z.object({
  emailAlertsEnabled: z.boolean().optional(),
  alertTypes: z
    .object({
      ninetyDay: z.boolean(),
      thirtyDay: z.boolean(),
      sevenDay: z.boolean(),
      expired: z.boolean(),
    })
    .optional(),
  alertFrequency: z.enum(["realtime", "daily"]).optional(),
  inAppNotificationsEnabled: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateNotificationsSchema.parse(body);

    // Store notification preferences in Clerk user metadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(brand.clerk_user_id, {
      publicMetadata: {
        notificationPreferences: {
          emailAlertsEnabled:
            validatedData.emailAlertsEnabled !== undefined
              ? validatedData.emailAlertsEnabled
              : true,
          alertTypes: validatedData.alertTypes || {
            ninetyDay: true,
            thirtyDay: true,
            sevenDay: true,
            expired: true,
          },
          alertFrequency: validatedData.alertFrequency || "realtime",
          inAppNotificationsEnabled:
            validatedData.inAppNotificationsEnabled !== undefined
              ? validatedData.inAppNotificationsEnabled
              : true,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const brand = await getCurrentBrand();
    if (!brand) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get notification preferences from Clerk user metadata
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(brand.clerk_user_id);
    const preferences =
      (user.publicMetadata?.notificationPreferences as {
        emailAlertsEnabled?: boolean;
        alertTypes?: {
          ninetyDay: boolean;
          thirtyDay: boolean;
          sevenDay: boolean;
          expired: boolean;
        };
        alertFrequency?: "realtime" | "daily";
        inAppNotificationsEnabled?: boolean;
      }) || null;

    return NextResponse.json({
      preferences: preferences || {
        emailAlertsEnabled: true,
        alertTypes: {
          ninetyDay: true,
          thirtyDay: true,
          sevenDay: true,
          expired: true,
        },
        alertFrequency: "realtime",
        inAppNotificationsEnabled: true,
      },
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}
