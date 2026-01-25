import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongoose";
import Booking from "../../../models/booking";
import Listing from "../../../models/Listing";
import { getTenant } from "../../../lib/tenant";
import { authMiddleware } from "../../../lib/middleware/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
    try {
        await connectDB();
        const tenant = await getTenant();
        if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

        const body = await req.json();
        const { listingId, date, timeSlots, quantity, customerInfo } = body;

        const listing = await Listing.findById(listingId);
        if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

        // Calculate Price
        let totalAmount = 0;
        if (listing.priceConfig.pricingModel === "per_hour") {
            totalAmount = listing.priceConfig.basePrice * timeSlots.length;
        } else if (listing.priceConfig.pricingModel === "per_day") {
            totalAmount = listing.priceConfig.basePrice * (quantity || 1);
        }

        const booking = await Booking.create({
            bookingId: `BK-${uuidv4().substring(0, 8).toUpperCase()}`,
            tenantId: tenant._id,
            listingId: listing._id,
            name: customerInfo.name,
            mobile: customerInfo.mobile,
            email: customerInfo.email,
            date,
            timeSlots,
            totalAmount,
            finalAmount: totalAmount, // TODO: Apply coupons
            status: "pending",
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
