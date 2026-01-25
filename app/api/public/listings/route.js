import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Listing from "../../../../models/Listing";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const type = searchParams.get('type');
        const city = searchParams.get('city');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const amenities = searchParams.get('amenities')?.split(',').filter(Boolean);
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;

        // Build query
        const query = { isActive: true };

        if (type) query.type = type;
        if (city) query['location.city'] = { $regex: city, $options: 'i' };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } },
            ];
        }
        if (minPrice || maxPrice) {
            query['priceConfig.basePrice'] = {};
            if (minPrice) query['priceConfig.basePrice'].$gte = parseFloat(minPrice);
            if (maxPrice) query['priceConfig.basePrice'].$lte = parseFloat(maxPrice);
        }
        if (amenities?.length > 0) {
            query.amenities = { $all: amenities };
        }

        // Build sort
        const sort = {};
        if (sortBy === 'price') sort['priceConfig.basePrice'] = sortOrder;
        else if (sortBy === 'rating') sort.averageRating = -1;
        else sort.createdAt = sortOrder;

        const listings = await Listing.find(query)
            .populate('tenantId', 'name slug')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .select('title slug description type location images priceConfig averageRating totalReviews amenities capacity isVerified isFeatured');

        const total = await Listing.countDocuments(query);

        // Get filter options
        const types = await Listing.distinct('type', { isActive: true });
        const cities = await Listing.distinct('location.city', { isActive: true });

        return NextResponse.json({
            listings,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            filters: { types, cities }
        });

    } catch (error) {
        console.error("Error fetching listings:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}
