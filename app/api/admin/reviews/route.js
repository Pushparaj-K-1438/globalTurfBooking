import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Review from "../../../../models/Review";
import { verifySession } from "../../../../lib/session";

// GET: Get reviews for tenant's listings
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const query = { tenantId: session.tenantId };
        if (status !== 'all') query.status = status;

        const reviews = await Review.find(query)
            .populate('userId', 'name email')
            .populate('listingId', 'title')
            .populate('bookingId', 'bookingDate')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Review.countDocuments(query);

        // Get stats
        const stats = {
            total: await Review.countDocuments({ tenantId: session.tenantId }),
            pending: await Review.countDocuments({ tenantId: session.tenantId, status: 'pending' }),
            approved: await Review.countDocuments({ tenantId: session.tenantId, status: 'approved' }),
        };

        return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit), stats });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
