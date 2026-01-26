import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Booking from "../../../../models/booking";
import "../../../../models/Listing"; // Ensure Listing model is registered
import "../../../../models/Tenant"; // Ensure Tenant model is registered
import { verifySession } from "../../../../lib/session";

// Force fresh import
export const dynamic = 'force-dynamic';

export async function GET(req) {
    console.log("Super Admin Bookings API Hit - Fresh");
    try {
        await connectDB();
        const session = await verifySession(req);
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Fetch all bookings sorted by date (newest first)
        const bookings = await Booking.find({})
            .sort({ createdAt: -1 })
            .populate({ path: 'tenantId', select: 'name slug', options: { strictPopulate: false } })
            .populate({ path: 'listingId', select: 'title', options: { strictPopulate: false } })
            .limit(100);

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Super Admin Bookings Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message, stack: error.stack }, { status: 500 });
    }
}
