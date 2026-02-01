import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongoose";
import Booking from "../../../models/booking";
import Listing from "../../../models/Listing";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listingId');
        const date = searchParams.get('date');

        if (!listingId || !date) {
            return NextResponse.json({ error: "listingId and date are required" }, { status: 400 });
        }

        // Fetch listing to get its default availability/slots
        const listing = await Listing.findById(listingId);
        if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

        // Logic here would normally check the business hours/rules
        // For now, let's assume a set of standard slots or get them from listing config
        const defaultSlots = [
            "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00",
            "10:00 - 11:00", "11:00 - 12:00", "15:00 - 16:00", "16:00 - 17:00",
            "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00",
            "21:00 - 22:00"
        ];

        // Fetch existing bookings for this listing and date
        const bookings = await Booking.find({
            listingId,
            date: new Date(date),
            status: { $in: ['confirmed', 'pending'] }
        });

        // Track booked slots
        const bookedSlots = new Set();
        bookings.forEach(b => {
            b.timeSlots.forEach(slot => bookedSlots.add(slot));
        });

        // Map slots with availability
        const slotsWithAvailability = defaultSlots.map(time => ({
            time,
            isAvailable: !bookedSlots.has(time)
        }));

        return NextResponse.json(slotsWithAvailability);
    } catch (error) {
        console.error("Error fetching slots:", error);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}
