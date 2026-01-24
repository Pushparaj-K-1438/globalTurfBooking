import connectDB from "../../../../lib/mongose";
import Admin from "../../../../models/admin";
import { NextResponse } from "next/server";
import { createSession } from "../../../../lib/session";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        await connectDB();
        const { mobile, password } = await request.json();

        // Input validation
        if (!mobile || !password) {
            return NextResponse.json(
                { error: 'Mobile and password are required' },
                { status: 400 }
            );
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ mobile });
        if (existingAdmin) {
            return NextResponse.json(
                { error: 'An account with this mobile already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const adminUser = new Admin({
            mobile,
            password: hashedPassword
        });

        await adminUser.save();

        // Create session and get JWT token
        const token = await createSession({
            userId: adminUser._id.toString(),
            mobile: adminUser.mobile,
            role: 'admin'
        });

        // Return success response with token
        return NextResponse.json(
            {
                message: 'Registration successful',
                user: {
                    id: adminUser._id,
                    mobile: adminUser.mobile
                },
                token
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to create admin user' },
            { status: 500 }
        );
    }
}


