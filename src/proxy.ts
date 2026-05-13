import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Routes that require sign-in. Public site stays open; only /board and member-only APIs are protected.
const isProtectedRoute = createRouteMatcher([
  '/board(.*)',
  '/account(.*)',
  '/api/admin/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
