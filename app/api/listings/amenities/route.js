import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Amenity from "../../../../models/Amenity";

export async function GET() {
    try {
        await connectDB();
        const amenities = await Amenity.find({ isActive: true }).sort({ category: 1, name: 1 });
        return NextResponse.json(amenities);
    } catch (error) {
        console.error("[API /listings/amenities] Error:", error);
        return NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 });
    }
}
