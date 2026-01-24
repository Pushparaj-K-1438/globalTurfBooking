'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This is a secure way to generate a secret key if one isn't provided
const getJwtSecretKey = () => {
    const secret = process.env.SECRET || 'your-secret-key';
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return new TextEncoder().encode(secret);
};

const COOKIE_NAME = 'session';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
};

export async function encrypt(payload) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 1 week from now
    
    return new SignJWT({ ...payload, expires: expires.toISOString() })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days expiration
        .sign(getJwtSecretKey());
}

export async function decrypt(session) {
    if (!session) return null;
    
    try {
        const { payload } = await jwtVerify(session, getJwtSecretKey(), {
            algorithms: ['HS256']
        });
        return payload;
    } catch (error) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            console.log('Session expired');
        } else {
        }
        return null;
    }
}

export async function createSession(userData) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 1 week
    
    const session = await encrypt({ 
        userId: userData.userId,
        mobile: userData.mobile,
        role: userData.role || 'user',
        expires: expires.toISOString()
    });
    
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, session, {
        ...COOKIE_OPTIONS,
        expires: new Date(expires.getTime())
    });
    
    return session;
}

// Helper function to get the session token (for use in server components)
export async function getSessionToken() {
    const cookieStore = cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
}

export async function verifySession(request) {
    try {
        // Get the session token from the request cookies
        const sessionToken = request?.cookies?.get(COOKIE_NAME)?.value || 
                           (await getSessionToken());
        
        if (!sessionToken) {
            console.log('No session token found');
            return null;
        }
        
        const payload = await decrypt(sessionToken);
        
        if (!payload?.userId) {
            console.log('No userId in payload');
            return null;
        }
        
        // Check if token is about to expire soon (within 1 hour)
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp - now < 3600) { // 1 hour
            console.log('Refreshing expiring token');
            // Create new session with the same user data
            const newSession = await createSession({
                userId: payload.userId,
                mobile: payload.mobile,
                role: payload.role
            });
            
            return { 
                ...payload,
                session: newSession
            };
        }
        
        return payload;
    } catch (error) {
        console.error('Session verification error:', error);
        // Clear the session on error
        await deleteSession();
        return null;
    }
}

export async function deleteSession() {
    try {
        const cookieStore = cookies();
        cookieStore.delete(COOKIE_NAME);
        return true;
    } catch (error) {
        console.error('Error deleting session:', error);
        return false;
    }
}

// Helper function to set the session token (for use in server actions)
export async function setSessionToken(token, options = {}) {
    const cookieStore = cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: token,
        ...COOKIE_OPTIONS,
        ...options
    });
}

// Helper function to create a response with session cookie
export async function createSessionResponse(session, data = {}) {
    const response = NextResponse.json({
        ...data,
        success: true
    });

    if (session) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 1 week

        response.cookies.set({
            name: COOKIE_NAME,
            value: session,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: expires
        });
    }

    return response;
}