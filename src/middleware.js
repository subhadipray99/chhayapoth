import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const hasClerkKeys = !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

let middleware = () => NextResponse.next();

if (hasClerkKeys) {
  const isProtectedRoute = createRouteMatcher([
    '/author(.*)',
  ]);

  middleware = clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });
} else {
  // Log a server warning instead of crashing the process
  console.warn('Clerk API keys are missing. Middleware is operating in bypass mode.');
}

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js|jpeg|jpg|png|gif|svg|ico|webp|jp2|dmg|pdf|txt|csv|zip|tgz|gz|pkg|exe|app|tar|pkg|dmg|iso)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
