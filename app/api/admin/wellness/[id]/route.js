import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Listing from "../../../../../models/Listing";
import { verifySession } from "../../../../../lib/session";

// GET - Fetch single wellness service
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const service = await Listing.findOne({
            _id: id,
            tenantId: session.tenantId
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json(service, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update wellness service
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const service = await Listing.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { $set: body },
            { new: true }
        );

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json(service, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete wellness service
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const service = await Listing.findOneAndDelete({
            _id: id,
            tenantId: session.tenantId
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Service deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
