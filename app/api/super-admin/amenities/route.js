import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Amenity from "../../../../models/Amenity";

const createSlug = (text) => {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '_').replace(/[^\w\_]+/g, '').replace(/\_\_+/g, '_');
};

export async function GET() {
    try {
        await connectDB();
        const amenities = await Amenity.find({}).sort({ category: 1, name: 1 });
        return NextResponse.json(amenities);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, category, icon, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = createSlug(name);
        const existing = await Amenity.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: "Amenity already exists" }, { status: 400 });
        }

        const newAmenity = await Amenity.create({
            name, slug, category: category || 'general', icon: icon || 'Check', description, isActive: true
        });

        return NextResponse.json(newAmenity, { status: 201 });
    } catch (error) {
        console.error("Error creating amenity:", error);
        return NextResponse.json({ error: "Failed to create amenity" }, { status: 500 });
    }
}
