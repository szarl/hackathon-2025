import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/services/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(pathname);

  // Always sync Supabase session cookies first
  const response = await updateSession(request);

  // Define public routes that should never be protected
  const publicTopLevelRoutes = new Set(['', 'auth']);

  // Skip protection for API and Next internals (handled by matcher too), and the root landing page/auth flows
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] ?? '';

  const isPublicRoute = publicTopLevelRoutes.has(firstSegment);

  // Only guard dynamic `[userId]` space: any first segment that isn't a known public route
  const isUserSpace = !isPublicRoute && firstSegment.length > 0;

  if (!isUserSpace) {
    return response;
  }

  // Determine auth by presence of the token set in updateSession
  const authTokenCookie = response.cookies.get('supabase.auth.token');
  let isAuthenticated = false;
  if (authTokenCookie) {
    try {
      const parsed = JSON.parse(authTokenCookie.value);
      isAuthenticated = Boolean(parsed && parsed.id);
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    if (pathname.includes('registration')) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('redirectTo', 'registration');
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = new URL('/auth', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Exclude Next internals, static assets, and images. Run on everything else.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
