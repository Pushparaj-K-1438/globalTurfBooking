import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";

// GET - Fetch reviews for a listing (public)
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const listingId = searchParams.get('listingId');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        if (!listingId) {
            return NextResponse.json({ error: "listingId is required" }, { status: 400 });
        }

        const query = { listingId, isApproved: { $ne: false } };

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('userId', 'name avatar')
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Review.countDocuments(query)
        ]);

        // Calculate rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: query },
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach(r => {
            distribution[r._id] = r.count;
        });

        // Calculate average rating
        const averageRating = total > 0
            ? (Object.entries(distribution).reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0) / total).toFixed(1)
            : 0;

        // Format reviews with userName fallback
        const formattedReviews = reviews.map(review => ({
            ...review,
            userName: review.userId?.name || review.userName || 'Anonymous',
            userAvatar: review.userId?.avatar
        }));

        return NextResponse.json({
            reviews: formattedReviews,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            averageRating: parseFloat(averageRating),
            ratingDistribution: distribution
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

// POST - Submit a new review (public)
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { listingId, rating, comment, userName, userEmail } = body;

        if (!listingId || !rating) {
            return NextResponse.json({ error: "listingId and rating are required" }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }

        const review = await Review.create({
            listingId,
            rating,
            comment,
            userName: userName || 'Anonymous',
            userEmail,
            isApproved: false // Requires admin approval
        });

        return NextResponse.json({
            message: "Review submitted successfully. It will be visible after approval.",
            review
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
