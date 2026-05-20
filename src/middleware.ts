import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPage = pathname === '/login' || pathname === '/register';
  const isPublicApi = pathname === '/api/auth/login' || pathname === '/api/auth/register';

  // If public route, let it pass
  if (isPublicPage || isPublicApi) {
    return NextResponse.next();
  }

  // Get token from cookies or authorization header
  let token = request.cookies.get('token')?.value;

  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // If no token, redirect or return unauthorized
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    // Clear cookie and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // RBAC Gating for Admin-only APIs
  const isAdminRoute = 
    (pathname === '/api/projects' && request.method === 'POST') ||
    (pathname === '/api/tasks' && request.method === 'POST');

  if (isAdminRoute && payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
  }

  // Pass user info forward using request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-name', payload.name);

  // If user accesses root page (dashboard) or /projects but is logged in, allow
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any image file (png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg)$).*)',
  ],
};
