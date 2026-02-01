import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Listing from "../../../../../models/Listing";
import { verifySession } from "../../../../../lib/session";

// GET - Fetch single hotel
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const hotel = await Listing.findOne({
            _id: id,
            tenantId: session.tenantId
        });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        return NextResponse.json(hotel, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update hotel
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const hotel = await Listing.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { $set: body },
            { new: true }
        );

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        return NextResponse.json(hotel, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete hotel
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const hotel = await Listing.findOneAndDelete({
            _id: id,
            tenantId: session.tenantId
        });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Hotel deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
