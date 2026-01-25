import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import ListingType from "../../../../models/ListingType";

// Simple slugify function if not available
const createSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

// GET: List all types
export async function GET() {
    await connectDB();
    try {
        const types = await ListingType.find({}).sort({ createdAt: -1 });
        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch types" }, { status: 500 });
    }
}

// POST: Create a new type
export async function POST(req) {
    await connectDB();
    try {
        const body = await req.json();
        const { name, isPayable, description, icon } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = createSlug(name);

        // Check if exists
        const existing = await ListingType.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: "Type already exists" }, { status: 400 });
        }

        const newType = await ListingType.create({
            name,
            slug,
            isPayable: isPayable || false,
            description,
            icon: icon || 'Box',
            isActive: true
        });

        return NextResponse.json(newType, { status: 201 });
    } catch (error) {
        console.error("Error creating listing type:", error);
        return NextResponse.json({ error: "Failed to create type" }, { status: 500 });
    }
}
