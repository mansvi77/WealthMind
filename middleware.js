import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  
  // Directly extract the Supabase auth token from the browser cookies
  // Supabase stores the session under an 'sb-access-token' or project-specific cookie key
  const cookies = req.cookies;
  const hasSession = cookies.getAll().some(cookie => cookie.name.includes('auth-token') || cookie.name.includes('access-token'));

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
  const isProtectedPage = req.nextUrl.pathname.startsWith('/dashboard') || 
                          req.nextUrl.pathname.startsWith('/transactions') ||
                          req.nextUrl.pathname.startsWith('/budgets') ||
                          req.nextUrl.pathname.startsWith('/recurring');

  // Enforce access control rules based on cookie presence
  if (isProtectedPage && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/transactions/:path*', '/budgets/:path*', '/recurring/:path*', '/login', '/signup'],
}; 