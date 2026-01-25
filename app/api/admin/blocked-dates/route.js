import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import BlockedDate from "../../../../models/BlockedDate";
import { verifySession } from "../../../../lib/session";

// GET: Get blocked dates for tenant
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listingId');

        const query = { tenantId: session.tenantId, isActive: true };
        if (listingId) query.listingId = listingId;

        const blockedDates = await BlockedDate.find(query)
            .populate('listingId', 'title')
            .sort({ startDate: 1 });

        return NextResponse.json(blockedDates);
    } catch (error) {
        console.error("Error fetching blocked dates:", error);
        return NextResponse.json({ error: "Failed to fetch blocked dates" }, { status: 500 });
    }
}

// POST: Create blocked date
export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { listingId, blockType, startDate, endDate, slots, allDay, reason, notes, isRecurring, recurringPattern } = body;

        if (!listingId || !startDate || !endDate) {
            return NextResponse.json({ error: "Listing, start date, and end date are required" }, { status: 400 });
        }

        const blocked = await BlockedDate.create({
            listingId,
            tenantId: session.tenantId,
            blockType: blockType || 'other',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            slots,
            allDay: allDay !== false,
            reason,
            notes,
            isRecurring: isRecurring || false,
            recurringPattern,
            createdBy: session.userId,
            isActive: true,
        });

        return NextResponse.json(blocked, { status: 201 });
    } catch (error) {
        console.error("Error creating blocked date:", error);
        return NextResponse.json({ error: "Failed to create blocked date" }, { status: 500 });
    }
}
