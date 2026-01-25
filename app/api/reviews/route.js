import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Review from "../../../../models/Review";
import Booking from "../../../../models/booking";
import Listing from "../../../../models/Listing";
import { verifySession } from "../../../../lib/session";

// GET: Get reviews for a listing (public)
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listingId');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        if (!listingId) {
            return NextResponse.json({ error: "Listing ID required" }, { status: 400 });
        }

        const reviews = await Review.find({ listingId, status: 'approved' })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Review.countDocuments({ listingId, status: 'approved' });

        // Calculate rating breakdown
        const ratingBreakdown = await Review.aggregate([
            { $match: { listingId: listingId, status: 'approved' } },
            { $group: { _id: '$overallRating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        return NextResponse.json({
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            ratingBreakdown
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

// POST: Create a review (must have completed booking)
export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (!session?.userId) {
            return NextResponse.json({ error: "Please login to leave a review" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { bookingId, overallRating, title, comment, ratings, images } = body;

        if (!bookingId || !overallRating) {
            return NextResponse.json({ error: "Booking ID and rating are required" }, { status: 400 });
        }

        // Verify booking exists and is completed
        const booking = await Booking.findOne({
            _id: bookingId,
            userId: session.userId,
            status: 'completed'
        });

        if (!booking) {
            return NextResponse.json({ error: "Valid completed booking not found" }, { status: 400 });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return NextResponse.json({ error: "You've already reviewed this booking" }, { status: 400 });
        }

        const review = await Review.create({
            bookingId,
            listingId: booking.listingId,
            tenantId: booking.tenantId,
            userId: session.userId,
            overallRating,
            title,
            comment,
            ratings,
            images,
            status: 'pending', // Requires moderation
            isVerified: true,
        });

        // Update listing average rating
        const avgResult = await Review.aggregate([
            { $match: { listingId: booking.listingId, status: 'approved' } },
            { $group: { _id: null, avgRating: { $avg: '$overallRating' }, count: { $sum: 1 } } }
        ]);

        if (avgResult.length > 0) {
            await Listing.findByIdAndUpdate(booking.listingId, {
                averageRating: Math.round(avgResult[0].avgRating * 10) / 10,
                totalReviews: avgResult[0].count
            });
        }

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}
