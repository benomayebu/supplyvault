import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { SubscriptionTier, UserRole } from "@prisma/client";

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    if (!id || !email_addresses || email_addresses.length === 0) {
      return new Response("Missing required user data", {
        status: 400,
      });
    }

    const email = email_addresses[0].email_address;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || email;

    try {
      // Check if brand already exists (in case webhook is called multiple times)
      const existingBrand = await prisma.brand.findUnique({
        where: { clerk_user_id: id },
      });

      if (existingBrand) {
        console.log("Brand already exists for user:", id);
        return new Response("Brand already exists", { status: 200 });
      }

      // Create Brand record (main account)
      const brand = await prisma.brand.create({
        data: {
          clerk_user_id: id,
          company_name: fullName, // Default to user's name, can be updated later
          email: email,
          subscription_tier: SubscriptionTier.FREE,
        },
      });

      // Create User record (team member)
      await prisma.user.create({
        data: {
          clerk_user_id: id,
          brand_id: brand.id,
          email: email,
          full_name: fullName,
          role: UserRole.ADMIN, // First user is always admin
        },
      });

      console.log("Created brand and user for:", email);
    } catch (error) {
      console.error("Error creating brand/user:", error);
      return new Response("Error creating user record", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("Missing user ID", {
        status: 400,
      });
    }

    try {
      // Find the brand associated with this user
      const brand = await prisma.brand.findUnique({
        where: { clerk_user_id: id },
      });

      if (brand) {
        // Delete the brand (cascades will delete users, suppliers, certifications, alerts)
        await prisma.brand.delete({
          where: { id: brand.id },
        });

        console.log("Deleted brand and associated data for user:", id);
      } else {
        // If no brand found, try to delete user record directly
        await prisma.user.deleteMany({
          where: { clerk_user_id: id },
        });

        console.log("Deleted user records for:", id);
      }
    } catch (error) {
      console.error("Error deleting user data:", error);
      return new Response("Error deleting user record", {
        status: 500,
      });
    }
  }

  return new Response("", { status: 200 });
}
