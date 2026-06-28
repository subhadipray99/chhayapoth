import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Match all author panel routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/author(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js|jpeg|jpg|png|gif|svg|ico|webp|jp2|dmg|pdf|txt|csv|zip|tgz|gz|pkg|exe|app|tar|pkg|dmg|iso)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
