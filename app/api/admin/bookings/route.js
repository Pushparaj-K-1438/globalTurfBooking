import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Booking from "../../../../models/booking";
import Listing from "../../../../models/Listing";
import { verifySession } from "../../../../lib/session";

// GET - Fetch all bookings for admin's tenant
export async function GET(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit')) || 50;

        const query = { tenantId: session.tenantId };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        let bookings = await Booking.find(query)
            .populate('listingId', 'title type')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Apply search filter after query (for name/mobile/email)
        if (search) {
            const searchLower = search.toLowerCase();
            bookings = bookings.filter(b =>
                b.name?.toLowerCase().includes(searchLower) ||
                b.mobile?.includes(search) ||
                b.email?.toLowerCase().includes(searchLower) ||
                b.bookingId?.toLowerCase().includes(searchLower)
            );
        }

        // Calculate stats
        const allBookings = await Booking.find({ tenantId: session.tenantId }).lean();
        const stats = {
            total: allBookings.length,
            pending: allBookings.filter(b => b.status === 'pending').length,
            confirmed: allBookings.filter(b => b.status === 'confirmed').length,
            cancelled: allBookings.filter(b => b.status === 'cancelled').length,
            completed: allBookings.filter(b => b.status === 'completed').length,
            revenue: allBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.finalAmount || b.totalAmount || 0), 0)
        };

        return NextResponse.json({ bookings, stats }, { status: 200 });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a booking (admin can create on behalf of customers)
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { listingId, date, timeSlots, customerName, customerMobile, customerEmail, status } = body;

        const listing = await Listing.findOne({ _id: listingId, tenantId: session.tenantId });
        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        // Calculate price
        let totalAmount = 0;
        if (listing.priceConfig.pricingModel === "per_hour") {
            totalAmount = listing.priceConfig.basePrice * (timeSlots?.length || 1);
        } else {
            totalAmount = listing.priceConfig.basePrice;
        }

        const booking = await Booking.create({
            bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
            tenantId: session.tenantId,
            listingId: listing._id,
            name: customerName,
            mobile: customerMobile,
            email: customerEmail,
            date: new Date(date),
            timeSlots: timeSlots || [],
            totalAmount,
            finalAmount: totalAmount,
            status: status || 'confirmed',
            createdBy: session.userId
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
