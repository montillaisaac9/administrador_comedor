import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password'];

// Define paths that require ADMIN role
const adminOnlyPaths = ['/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // Check for authentication token on public paths
    const authToken = request.cookies.get('auth_token');
    
    // If user is already authenticated and trying to access login/register
    if (authToken && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }
  
  // For protected routes, check if user is authenticated
  const authToken = request.cookies.get('auth_token');
  
  if (!authToken) {
    // If not authenticated, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For admin-only routes, check user role from JWT
  if (adminOnlyPaths.some(path => pathname.startsWith(path))) {
    try {
      // Here we would typically decode and verify the JWT
      // For simplicity, we're checking the HTTP-only cookie in the backend
      // This check is just a placeholder
      
      // In a real implementation, you'd verify the JWT and check the role
      // For now, we'll allow the request through and let the backend handle role verification
      
      return NextResponse.next();
    } catch (error) {
      // If verification fails or user is not an admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Allow request for all other protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 