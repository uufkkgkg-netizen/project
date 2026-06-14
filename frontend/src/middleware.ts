import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths
  if (path.startsWith('/login') || path.startsWith('/register') || path === '/') {
    return NextResponse.next();
  }

  // Allow next internals and static files
  if (path.startsWith('/_next') || path.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('access_token')?.value;

  if (!token && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && path.startsWith('/dashboard')) {
    const decoded = parseJwt(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = decoded.role;
    
    // Super Admin Bypass
    if (role === 'SUPER_ADMIN') {
      return NextResponse.next();
    }

    // Role-based Path Restrictions
    // RECEPTIONIST sees only Appointments and Dashboard Home
    if (role === 'RECEPTIONIST') {
      if (path !== '/dashboard' && !path.startsWith('/dashboard/appointments')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // ACCOUNTANT sees only Billing and Dashboard Home
    if (role === 'ACCOUNTANT') {
      if (path !== '/dashboard' && !path.startsWith('/dashboard/billing')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // DOCTOR sees everything EXCEPT Billing/Settings (unless TENANT_ADMIN)
    if (role === 'DOCTOR') {
      if (path.startsWith('/dashboard/billing') || path.startsWith('/dashboard/settings')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
