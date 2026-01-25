import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import User from "../../../../models/User";
import { verifySession } from "../../../../lib/session";

export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (session?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
