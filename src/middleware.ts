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

  // Protect admin routes - only allow admin users
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/profile')) {
    if (!token || token.userType !== 'admin') {
      // Redirect tutors to their dashboard, non-authenticated users to login
      if (token?.userType === 'tutor') {
        return NextResponse.redirect(new URL('/tutor/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  // Protect tutor routes - only allow tutor users (except public profile pages)
  if (pathname.startsWith('/tutor/') && !pathname.match(/^\/tutor\/[^\/]+$/)) {
    if (!token || token.userType !== 'tutor') {
      // Redirect admins to their dashboard, non-authenticated users to login
      if (token?.userType === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/tutors/login', request.url));
      }
    }
  }

  // Allow profile access for both user types but redirect to appropriate profile
  if (pathname === '/dashboard/profile') {
    if (token?.userType === 'tutor') {
      return NextResponse.redirect(new URL('/tutor/profile', request.url));
    } else if (!token || token.userType !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/tutor/:path*']
}; 