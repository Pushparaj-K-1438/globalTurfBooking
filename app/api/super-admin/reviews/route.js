import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Review from "../../../../models/Review";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const query = status !== 'all' ? { status } : {};

        const reviews = await Review.find(query)
            .populate('userId', 'name email')
            .populate('listingId', 'title')
            .populate('tenantId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Review.countDocuments(query);

        return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
