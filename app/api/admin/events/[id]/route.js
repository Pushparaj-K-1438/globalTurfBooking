import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Listing from "../../../../../models/Listing";
import { verifySession } from "../../../../../lib/session";

// GET - Fetch single event
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const event = await Listing.findOne({
            _id: id,
            tenantId: session.tenantId
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update event
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const event = await Listing.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { $set: body },
            { new: true }
        );

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete event
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const event = await Listing.findOneAndDelete({
            _id: id,
            tenantId: session.tenantId
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Event deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
