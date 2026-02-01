import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Listing from "../../../../models/Listing";

// Platform-wide listings API - allows browsing across all active tenants
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
        const featured = searchParams.get('featured');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;

        // Build query for platform-wide browsing
        const query = { isActive: true };

        if (type) {
            // Support multiple types (e.g., type=hotel,event)
            const types = type.split(',').map(t => t.trim().toLowerCase());
            if (types.length === 1) {
                query.type = { $regex: new RegExp(types[0], 'i') };
            } else {
                query.type = { $in: types.map(t => new RegExp(t, 'i')) };
            }
        }

        if (city) query['location.city'] = { $regex: city, $options: 'i' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
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

        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Build sort
        const sort = {};
        if (sortBy === 'price_low') sort['priceConfig.basePrice'] = 1;
        else if (sortBy === 'price_high') sort['priceConfig.basePrice'] = -1;
        else if (sortBy === 'rating') sort.averageRating = -1;
        else if (sortBy === 'popular') sort.totalReviews = -1;
        else sort.createdAt = -1;

        // Featured listings first, then sort
        const sortWithFeatured = { isFeatured: -1, ...sort };

        const listings = await Listing.find(query)
            .populate('tenantId', 'name slug')
            .sort(sortWithFeatured)
            .skip((page - 1) * limit)
            .limit(limit)
            .select('title slug description type location images priceConfig averageRating totalReviews amenities capacity isVerified isFeatured tenantId category')
            .lean();

        const total = await Listing.countDocuments(query);

        // Get filter options (from all active listings)
        const typeAggregation = await Listing.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const cityAggregation = await Listing.aggregate([
            { $match: { isActive: true, 'location.city': { $exists: true, $ne: '' } } },
            { $group: { _id: '$location.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        return NextResponse.json({
            listings,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            filters: {
                types: typeAggregation.map(t => ({ name: t._id, count: t.count })),
                cities: cityAggregation.map(c => ({ name: c._id, count: c.count }))
            }
        });

    } catch (error) {
        console.error("Error fetching platform listings:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}
