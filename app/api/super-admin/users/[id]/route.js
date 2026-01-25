import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import User from "../../../../models/User";
import { verifySession } from "../../../../lib/session";

export async function PATCH(req, { params }) {
    try {
        const session = await verifySession(req);
        if (session?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();

        await connectDB();
        const user = await User.findByIdAndUpdate(id, { $set: body }, { new: true }).select('-password');

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
