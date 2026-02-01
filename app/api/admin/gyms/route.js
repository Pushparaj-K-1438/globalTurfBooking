import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Listing from "../../../../models/Listing";
import { verifySession } from "../../../../lib/session";

// GET - Fetch all gyms for admin's tenant
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
            type: { $regex: /gym|fitness|workout/i }
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } }
            ];
        }

        const gyms = await Listing.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(gyms, { status: 200 });
    } catch (error) {
        console.error("Error fetching gyms:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new gym listing
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const gym = await Listing.create({
            ...body,
            tenantId: session.tenantId,
            type: body.type || 'gym',
            isActive: true,
            createdBy: session.userId
        });

        return NextResponse.json(gym, { status: 201 });
    } catch (error) {
        console.error("Error creating gym:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
