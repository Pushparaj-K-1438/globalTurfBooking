import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import PricingModel from "../../../../models/PricingModel";

const createSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^\w\_]+/g, '')
        .replace(/\_\_+/g, '_');
};

// GET: List all pricing models
export async function GET() {
    try {
        await connectDB();
        const models = await PricingModel.find({}).sort({ createdAt: -1 });
        return NextResponse.json(models);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch pricing models" }, { status: 500 });
    }
}

// POST: Create a new pricing model
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = createSlug(name);

        const existing = await PricingModel.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: "Pricing model already exists" }, { status: 400 });
        }

        const newModel = await PricingModel.create({
            name,
            slug,
            description,
            isActive: true
        });

        return NextResponse.json(newModel, { status: 201 });
    } catch (error) {
        console.error("Error creating pricing model:", error);
        return NextResponse.json({ error: "Failed to create pricing model" }, { status: 500 });
    }
}
