import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import ListingType from "../../../../models/ListingType";

export async function GET() {
    try {
        await connectDB();
        const types = await ListingType.find({ isActive: true }).sort({ name: 1 });
        return NextResponse.json(types);
    } catch (error) {
        console.error("[API /listings/types] Error:", error);
        return NextResponse.json({ error: "Failed to fetch listing types", details: error.message }, { status: 500 });
    }
}
