import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongoose";
import Booking from "../../../models/booking";
import Listing from "../../../models/Listing";
import { getTenant } from "../../../lib/tenant";

export async function POST(req) {
    try {
        await connectDB();

        // Get tenant from context (subdomain or header)
        const tenant = await getTenant();
        if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

        const body = await req.json();
        const {
            listingId, date, timeSlots, guests,
            name, email, mobile, notes
        } = body;

        // Basic validation
        if (!listingId || !date || !name || !email || !mobile) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

        // Calculate Pricing on Server (Secure)
        const basePrice = listing.priceConfig?.basePrice || 0;
        let subtotal = 0;

        if (listing.type === 'turf' || listing.priceConfig?.pricingModel === 'per_slot') {
            subtotal = basePrice * (timeSlots?.length || 1);
        } else if (listing.type === 'hotel' || listing.priceConfig?.pricingModel === 'per_night') {
            subtotal = basePrice; // Simplified for now
        } else {
            subtotal = basePrice;
        }

        const taxAmount = Math.round(subtotal * 0.18); // 18% GST example
        const finalAmount = subtotal + taxAmount;

        // Generate a random-ish ID for this booking
        const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();
        const bookingId = `BK-${shortId}`;

        const booking = await Booking.create({
            bookingId,
            tenantId: tenant._id,
            listingId: listing._id,
            name,
            email,
            mobile,
            date: new Date(date),
            timeSlots: timeSlots || [],
            guests: guests || 1,
            notes,
            totalAmount: subtotal,
            taxAmount,
            finalAmount,
            status: "pending",
            paymentStatus: "pending"
        });

        // Trigger Notification (simplified)
        try {
            const Notification = (await import("../../../models/Notification")).default;
            await Notification.create({
                tenantId: tenant._id,
                type: 'booking',
                priority: 'high',
                title: 'New Booking Recieved',
                message: `${name} has requested a booking for ${listing.title} on ${date}.`,
                metadata: { bookingId: booking._id }
            });
        } catch (err) { console.error("Notification creation failed", err); }

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Booking creation error:", error);
        return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
    }
}

// GET - Fetch bookings for the current tenant (Admin)
export async function GET(req) {
    try {
        await connectDB();
        const tenant = await getTenant();
        if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status');

        const query = { tenantId: tenant._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('listingId', 'title type');

        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}
