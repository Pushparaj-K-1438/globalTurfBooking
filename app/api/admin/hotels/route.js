import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Listing from "../../../../models/Listing";
import { verifySession } from "../../../../lib/session";

// GET - Fetch all hotels for admin's tenant
export async function GET(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        const query = {
            tenantId: session.tenantId,
            type: { $regex: /hotel|room|resort/i }
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } }
            ];
        }

        const hotels = await Listing.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(hotels, { status: 200 });
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new hotel listing
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const hotel = await Listing.create({
            ...body,
            tenantId: session.tenantId,
            type: body.type || 'hotel',
            isActive: true,
            createdBy: session.userId
        });

        return NextResponse.json(hotel, { status: 201 });
    } catch (error) {
        console.error("Error creating hotel:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
