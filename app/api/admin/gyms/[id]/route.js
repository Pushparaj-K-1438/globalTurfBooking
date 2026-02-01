import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Listing from "../../../../../models/Listing";
import { verifySession } from "../../../../../lib/session";

// GET - Fetch single gym
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const gym = await Listing.findOne({
            _id: id,
            tenantId: session.tenantId
        });

        if (!gym) {
            return NextResponse.json({ error: "Gym not found" }, { status: 404 });
        }

        return NextResponse.json(gym, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update gym
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const gym = await Listing.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { $set: body },
            { new: true }
        );

        if (!gym) {
            return NextResponse.json({ error: "Gym not found" }, { status: 404 });
        }

        return NextResponse.json(gym, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete gym
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const gym = await Listing.findOneAndDelete({
            _id: id,
            tenantId: session.tenantId
        });

        if (!gym) {
            return NextResponse.json({ error: "Gym not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Gym deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
