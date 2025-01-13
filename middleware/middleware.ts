import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload, roleMap } from '@/utils/auth';


// Pages that don't require authentication
const publicPages = [
  '/',
  '/about',
  '/contact',
  '/doctors', // Public doctor listing
  '/blogs',
];

// Pages that require authentication but are role-specific
const roleSpecificPages = {
  patient: ['/dashboard/patient', '/appointments', '/medical-records'],
  doctor: ['/dashboard/doctor', '/my-patients', '/schedule'],
  admin: ['/dashboard/admin', '/manage-users', '/manage-doctors', '/reports'],
};

// Auth pages (should be accessible only when logged out)
const authPages = ['/signin', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public pages without authentication
  if (publicPages.some(page => pathname.startsWith(page))) {
    return NextResponse.next();
  }

  // Get token from cookies (preferred) or authorization header
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.split(' ')[1];

  // Check if trying to access auth pages while logged in
  if (authPages.some(page => pathname.startsWith(page))) {
    if (token) {
      // Redirect to appropriate dashboard based on role
      try {
        const decoded: TokenPayload = jwtDecode(token);
        const userType = roleMap[decoded.roleId];
        return NextResponse.redirect(new URL(`/dashboard/${userType}`, request.url));
      } catch {
        // If token is invalid, allow access to auth pages
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // If no token, redirect to signin
  if (!token) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  try {
    // Decode and verify token
    const decoded: TokenPayload = jwtDecode(token);
    const userType = roleMap[decoded.roleId];

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return redirectToSignIn(request);
    }

    // Check role-specific access
    const isAdminRoute = pathname.startsWith('/dashboard/admin');
    const isDoctorRoute = pathname.startsWith('/dashboard/doctor');
    const isPatientRoute = pathname.startsWith('/dashboard/patient');

    if (
      (isAdminRoute && userType !== 'admin') ||
      (isDoctorRoute && userType !== 'doctor') ||
      (isPatientRoute && userType !== 'patient')
    ) {
      // Redirect to appropriate dashboard if trying to access wrong role's pages
      return NextResponse.redirect(new URL(`/dashboard/${userType}`, request.url));
    }

    // Verify role-specific page access
    const userPages = roleSpecificPages[userType as keyof typeof roleSpecificPages] || [];
    if (userPages.some(page => pathname.startsWith(page))) {
      return NextResponse.next();
    }

    // For any other authenticated routes
    return NextResponse.next();
  } catch (error) {
    return redirectToSignIn(request);
  }
}

function redirectToSignIn(request: NextRequest) {
  const signInUrl = new URL('/signin', request.url);
  signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (optional - remove if you want to protect API routes too)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};