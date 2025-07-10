import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: We'll handle JWT verification in API routes instead of middleware
// to avoid Edge Runtime compatibility issues

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For now, we'll handle authentication in the components themselves
  // This avoids Edge Runtime compatibility issues with JWT verification
  return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: []
}; 