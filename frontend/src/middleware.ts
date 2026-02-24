import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes require authentication
const PROTECTED_PATHS = ['/dashboard'];
// Public routes that should redirect authenticated users
const AUTH_PATHS = ['/auth'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
    const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));

    // If trying to access protected route without a token → redirect to /auth
    if (isProtected && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        return NextResponse.redirect(url);
    }

    // If already logged in (has token) and going to /auth → redirect to dashboard
    if (isAuthRoute && token) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/customer'; // AuthContext will redirect to correct role page
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth'],
};
