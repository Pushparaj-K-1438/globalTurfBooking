import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongoose";
import Listing from "../../../models/Listing";
import { getTenant } from "../../../lib/tenant";

export async function GET(req) {
    try {
        await connectDB();
        const tenant = await getTenant();

        if (!tenant) {
            console.warn("[API Listings] Tenant not identified for request");
            return NextResponse.json({ error: "Tenant not identified", details: "Could not resolve tenant from subdomain or session" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const category = searchParams.get("category");

        const query = { tenantId: tenant._id, isActive: true };
        if (type) query.type = type;
        if (category) query.category = category;

        console.log(`[API Listings] Fetching for tenant: ${tenant.slug || tenant._id}, query:`, query);

        const listings = await Listing.find(query).sort({ createdAt: -1 });

        if (!Array.isArray(listings)) {
            console.error("[API Listings] Expected array from Mongoose, got:", typeof listings);
            return NextResponse.json([], { status: 200 }); // Fallback to empty array
        }

        return NextResponse.json(listings);
    } catch (error) {
        console.error("[API Listings] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const tenant = await getTenant();
        if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

        // TODO: Add auth check for TENANT_OWNER/ADMIN
        const body = await req.json();
        const listing = await Listing.create({
            ...body,
            tenantId: tenant._id,
        });

        return NextResponse.json(listing, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
