import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token to check user type
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Get base URL dynamically
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                 process.env.NEXTAUTH_URL || 
                 process.env.VERCEL_URL ? 
                 `https://${process.env.VERCEL_URL}` : 
                 request.nextUrl.origin;

  // Protect admin routes - only allow admin users
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/profile')) {
    if (!token || token.userType !== 'admin') {
      // Redirect tutors to their dashboard, non-authenticated users to login
      if (token?.userType === 'tutor') {
        return NextResponse.redirect(new URL('/tutor/dashboard', baseUrl));
      } else {
        return NextResponse.redirect(new URL('/admin/login', baseUrl));
      }
    }
  }

  // Protect tutor routes - only allow tutor users (except public profile pages)
  if (pathname.startsWith('/tutor/') && !pathname.match(/^\/tutor\/[^\/]+$/)) {
    if (!token || token.userType !== 'tutor') {
      // Redirect admins to their dashboard, non-authenticated users to login
      if (token?.userType === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', baseUrl));
      } else {
        return NextResponse.redirect(new URL('/tutors/login', baseUrl));
      }
    }
  }

  // Allow profile access for both user types but redirect to appropriate profile
  if (pathname === '/dashboard/profile') {
    if (token?.userType === 'tutor') {
      return NextResponse.redirect(new URL('/tutor/profile', baseUrl));
    } else if (!token || token.userType !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', baseUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/tutor/:path*']
}; 