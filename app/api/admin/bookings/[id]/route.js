import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Booking from "../../../../../models/booking";
import { verifySession } from "../../../../../lib/session";

// GET - Fetch single booking
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const booking = await Booking.findOne({
            _id: id,
            tenantId: session.tenantId
        }).populate('listingId', 'title type images');

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json(booking, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update booking status or details
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, notes, date, timeSlots } = body;

        const booking = await Booking.findOne({
            _id: id,
            tenantId: session.tenantId
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Update fields
        if (status) booking.status = status;
        if (notes) booking.notes = notes;
        if (date) booking.date = new Date(date);
        if (timeSlots) booking.timeSlots = timeSlots;

        // Track status change
        if (status && status !== booking.status) {
            booking.statusHistory = booking.statusHistory || [];
            booking.statusHistory.push({
                status,
                changedAt: new Date(),
                changedBy: session.userId
            });
        }

        await booking.save();

        return NextResponse.json(booking, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Cancel booking
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const booking = await Booking.findOne({
            _id: id,
            tenantId: session.tenantId
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Soft delete by changing status
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancelledBy = session.userId;
        await booking.save();

        return NextResponse.json({ message: "Booking cancelled" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
