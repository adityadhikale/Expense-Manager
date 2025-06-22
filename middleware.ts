import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/',
  '/transactions',
  '/accounts',
  '/categories',
  '/settings',
]);

// Define public routes that are always accessible
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/_next/(.*)',
  '/favicon.ico',
  '/api/(.*)',
]);

export default clerkMiddleware((auth, request) => {
  try {
    // Always allow public routes without auth checks
    if (isPublicRoute(request)) {
      return NextResponse.next();
    }
    
    // Check if the route requires authentication
    if (isProtectedRoute(request)) {
      // Protect the route - redirects to sign-in if not authenticated
      auth().protect();
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware authentication error:", error);
    
    // If there's an error, redirect to sign-in page with return URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
