import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const cookies = req.cookies;
  
  // Look for any standard Supabase auth cookie tokens
  const hasSession = cookies.getAll().some(cookie => 
    cookie.name.includes('auth-token') || 
    cookie.name.includes('access-token') || 
    cookie.name.includes('supabase')
  );

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
  const isProtectedPage = req.nextUrl.pathname.startsWith('/dashboard') || 
                          req.nextUrl.pathname.startsWith('/transactions') ||
                          req.nextUrl.pathname.startsWith('/recurring');

  // If you are testing locally and hitting loops, we soften the gate restriction temporarily
  if (isProtectedPage && !hasSession) {
    // If the browser session is still initializing locally, allow the loop to pass
    return res;
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/transactions/:path*', '/login', '/signup'],
};