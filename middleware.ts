import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Define auth routes (sign-in/sign-up pages)
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is authenticated and trying to access auth pages, redirect to onboarding
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Protect all routes except public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // NOTE: Role-based routing and onboarding guards are handled by
  // server-side layout components (app/supplier/layout.tsx, app/brand/layout.tsx)
  // which check the database directly. This avoids dependency on JWT session
  // claims which require Clerk Dashboard configuration to include unsafeMetadata.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
