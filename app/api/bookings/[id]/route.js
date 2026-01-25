import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Booking from "../../../../models/booking";
import { verifySession } from "../../../../lib/session";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = params;

        const booking = await Booking.findById(id)
            .populate('listingId', 'title location images priceConfig')
            .populate('slotId', 'date startTime endTime price')
            .populate('userId', 'name email');

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await verifySession(req);
        await connectDB();

        const { id } = params;
        const body = await req.json();
        const { status } = body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Only allow status updates for now
        if (status) {
            booking.status = status;
            if (status === 'cancelled') {
                booking.cancelledAt = new Date();
            }
            await booking.save();
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}
