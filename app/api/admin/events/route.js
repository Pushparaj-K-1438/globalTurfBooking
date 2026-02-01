import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Listing from "../../../../models/Listing";
import { verifySession } from "../../../../lib/session";

// GET - Fetch all events for admin's tenant
export async function GET(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');

        const query = {
            tenantId: session.tenantId,
            type: { $regex: /event|venue|conference|wedding/i }
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        const events = await Listing.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(events, { status: 200 });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new event listing
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const event = await Listing.create({
            ...body,
            tenantId: session.tenantId,
            type: body.type || 'event',
            isActive: true,
            createdBy: session.userId
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
