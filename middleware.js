import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, deleteSession } from "./lib/session";

const publicPaths = ['/login', '/register', '/forgot-password'];
const authPaths = ['/auth'];

function isPublicPath(path) {
    return publicPaths.some(publicPath => 
        path === publicPath || path.startsWith(`${publicPath}/`)
    );
}

function isAuthPath(path) {
    return authPaths.some(authPath => 
        path.startsWith(authPath)
    );
}

export default async function middleware(request) {
    const { pathname } = request.nextUrl;
    const isApiRoute = pathname.startsWith('/api');
    const isAuthRoute = isAuthPath(pathname);
    const isPublic = isPublicPath(pathname);

    // Skip middleware for API routes, static files, and _next paths
    if (isApiRoute || 
        pathname.startsWith('/_next') || 
        pathname.includes('.') || 
        pathname === '/favicon.ico') {
        return NextResponse.next();
    }

    try {
        const session = await verifySession();
        const response = NextResponse.next();

        // If we have a new session from the refresh logic, set it in the response
        if (session?.session) {
            const expires = new Date();
            expires.setDate(expires.getDate() + 7); // 1 week
            
            response.cookies.set({
                name: 'session',
                value: session.session,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                expires
            });
        }

        // Redirect to login if trying to access protected routes without a session
        if (isAuthRoute && !session?.userId) {
            const url = new URL('/login', request.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }

        // If user is logged in and tries to access public pages, redirect to dashboard
        if (isPublic && session?.userId) {
            return NextResponse.redirect(new URL('/auth/dashboard', request.url));
        }

        return response;
    } catch (error) {
        console.error('Middleware error:', error);
        // Clear the session on error
        await deleteSession();
        
        // Only redirect to login if not already on a public path
        if (!isPublic) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'session_expired');
            return NextResponse.redirect(loginUrl);
        }
        
        return NextResponse.next();
    }
}

export const config = {
   matcher: ['/((?!api|_next/static|_next/image).*)']
}