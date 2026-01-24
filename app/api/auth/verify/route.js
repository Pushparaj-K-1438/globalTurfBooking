import { verifySession, createSessionResponse } from "../../../../lib/session";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function GET(request) {
  try {
    // Verify the session with the request object
    const session = await verifySession(request);
    
    // If no valid session, return unauthenticated
    if (!session) {
      return NextResponse.json(
        { 
          authenticated: false,
          error: 'No active session found'
        },
        { 
          status: 200,
          headers: CACHE_HEADERS
        }
      );
    }

    // Create response with user data
    const responseData = {
      authenticated: true,
      user: {
        id: session.userId,
        mobile: session.mobile,
        role: session.role
      }
    };

    // If we have a new session from the refresh logic, set it in the response
    if (session.session) {
      const response = NextResponse.json(responseData, {
        status: 200,
        headers: CACHE_HEADERS
      });

      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 1 week
      
      response.cookies.set({
        name: 'session',
        value: session.session,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expires.toISOString()
      });

      return response;
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: CACHE_HEADERS
    });
  } catch (error) {
    console.error('Verification error:', error);
    
    // Create error response
    const response = NextResponse.json(
      { 
        authenticated: false, 
        error: 'Session verification failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message 
        })
      },
      { 
        status: 401,
        headers: CACHE_HEADERS
      }
    );
    
    // Clear the session cookie on error
    response.cookies.set({
      name: 'session',
      value: '',
      path: '/',
      maxAge: -1 // Expire immediately
    });
    
    return response;
  }
}
