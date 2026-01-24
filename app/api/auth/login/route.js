import connectDB from "../../../../lib/mongose";
import Admin from "../../../../models/admin";
import { NextResponse } from "next/server";
import { createSession, createSessionResponse } from "../../../../lib/session";
import bcrypt from "bcryptjs";

const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function POST(request) {
    try {
        await connectDB();
        const { mobile, password } = await request.json();

        // Input validation
        if (!mobile || !password) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Mobile and password are required' 
                }, 
                { 
                    status: 400,
                    headers: CACHE_HEADERS
                }
            );
        }

        // Check if admin exists
        const admin = await Admin.findOne({ mobile }).select('+password');
        if (!admin) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid credentials' // Generic message for security
                }, 
                { 
                    status: 401,
                    headers: CACHE_HEADERS
                }
            );
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid credentials' // Generic message for security
                }, 
                { 
                    status: 401,
                    headers: CACHE_HEADERS
                }
            );
        }

        // Create session and get JWT token
        const sessionToken = await createSession({
            userId: admin._id.toString(),
            mobile: admin.mobile,
            role: 'admin'
        });

        // Create response with session cookie
        const response = NextResponse.json(
            { 
                success: true,
                message: 'Login successful',
                user: {
                    id: admin._id,
                    mobile: admin.mobile,
                    role: 'admin'
                }
            },
            { 
                status: 200,
                headers: CACHE_HEADERS
            }
        );

        // Set the session cookie
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 1 week

        response.cookies.set({
            name: 'session',
            value: sessionToken,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            expires: expires
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'An error occurred during login',
                ...(process.env.NODE_ENV === 'development' && { 
                    details: error.message 
                })
            },
            { 
                status: 500,
                headers: CACHE_HEADERS
            }
        );
    }
}
