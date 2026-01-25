import connectDB from "../../../../lib/mongoose";
import User from "../../../../models/User";
import Tenant from "../../../../models/Tenant";
import { NextResponse } from "next/server";
import { createSession } from "../../../../lib/session";
import bcrypt from "bcryptjs";

const CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
};

export async function POST(request) {
    try {
        await connectDB();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400, headers: CACHE_HEADERS });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.isActive) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401, headers: CACHE_HEADERS });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401, headers: CACHE_HEADERS });
        }

        // Check Tenant Status if user is tenant staff
        if (['TENANT_OWNER', 'TENANT_ADMIN'].includes(user.role) && user.tenantId) {
            const tenant = await Tenant.findById(user.tenantId);
            if (!tenant) {
                return NextResponse.json({ success: false, error: 'Tenant account not found.' }, { status: 403, headers: CACHE_HEADERS });
            }
            if (tenant.status !== 'active') {
                return NextResponse.json({ success: false, error: `Your tenant account is ${tenant.status}. Please contact support.` }, { status: 403, headers: CACHE_HEADERS });
            }
        }

        const sessionToken = await createSession({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            tenantId: user.tenantId?.toString()
        });

        const response = NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            },
            { status: 200, headers: CACHE_HEADERS }
        );

        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        response.cookies.set({
            name: 'session',
            value: sessionToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: expires
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: 'An error occurred during login' }, { status: 500, headers: CACHE_HEADERS });
    }
}
