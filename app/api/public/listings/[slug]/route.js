import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Listing from "../../../../../models/Listing";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { slug } = params;

        // Try to find by slug first, then by ID
        let listing = await Listing.findOne({ slug, isActive: true })
            .populate('tenantId', 'name slug');

        if (!listing) {
            // Try by ID
            listing = await Listing.findOne({ _id: slug, isActive: true })
                .populate('tenantId', 'name slug');
        }

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Error fetching listing:", error);
        return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
    }
}
