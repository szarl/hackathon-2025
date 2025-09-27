import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/services/supabase/middleware';

export async function middleware(request: NextRequest) {
  console.log(request);
  const { pathname } = request.nextUrl;

  // Update session first
  const supabaseResponse = await updateSession(request);

  // Check if user is authenticated by looking at the supabase auth token cookie
  const authToken = supabaseResponse.cookies.get('supabase.auth.token');
  let isAuthenticated = false;

  if (authToken) {
    try {
      const user = JSON.parse(authToken.value);
      isAuthenticated = !!user && user.id; // Check if user exists and has an ID
    } catch (error) {
      // Invalid token format
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
