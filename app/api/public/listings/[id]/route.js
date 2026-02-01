import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Listing from "../../../../../models/Listing";
import mongoose from "mongoose";

// GET - Fetch a single listing by ID (public)
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        let listing = null;

        // Try searching by ID first (if valid ObjectId)
        if (mongoose.Types.ObjectId.isValid(id)) {
            listing = await Listing.findById(id).populate('tenantId', 'name slug logo').lean();
        }

        // If not found by ID, try searching by slug
        if (!listing) {
            listing = await Listing.findOne({ slug: id }).populate('tenantId', 'name slug logo').lean();
        }

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        // Increment view count (optional - can be done async)
        Listing.updateOne({ _id: listing._id }, { $inc: { views: 1 } }).catch(console.error);

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Error fetching listing:", error);
        return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
    }
}
