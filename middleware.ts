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

// Define supplier routes
const isSupplierRoute = createRouteMatcher(["/supplier(.*)"]);

// Define brand routes
const isBrandRoute = createRouteMatcher(["/brand(.*)"]);

// Define onboarding routes
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

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

  // Role-based route protection
  if (userId && !isOnboardingRoute(req) && !isPublicRoute(req)) {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.unsafeMetadata as
      | { stakeholderRole?: string }
      | undefined;
    const role = metadata?.stakeholderRole;

    // If user has a role, enforce route restrictions
    if (role) {
      if (role === "SUPPLIER" && isBrandRoute(req)) {
        return NextResponse.redirect(new URL("/supplier/dashboard", req.url));
      }

      if (role === "BRAND" && isSupplierRoute(req)) {
        return NextResponse.redirect(new URL("/brand/dashboard", req.url));
      }

      // Redirect /dashboard to role-specific dashboard
      if (req.nextUrl.pathname.startsWith("/dashboard")) {
        if (role === "SUPPLIER") {
          return NextResponse.redirect(new URL("/supplier/dashboard", req.url));
        } else if (role === "BRAND") {
          return NextResponse.redirect(new URL("/brand/dashboard", req.url));
        }
      }
    } else {
      // If user doesn't have a role yet, redirect to onboarding
      if (!isOnboardingRoute(req)) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
