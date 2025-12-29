import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Define routes that require authentication (dashboard)
const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const url = request.nextUrl;

  // Allow public routes - always accessible
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Require authentication for dashboard routes
  if (isDashboardRoute(request)) {
    if (!userId) {
      // Not authenticated - redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // User is authenticated - allow access
    // Onboarding check happens in dashboard layout, not middleware
    return NextResponse.next();
  }

  // Default: require authentication for all other routes
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
