import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import PricingModel from "../../../../models/PricingModel";

console.log("Loading pricing-models route");

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
    console.log("GET /api/super-admin/pricing-models: Started");
    try {
        console.log("GET /api/super-admin/pricing-models: Connecting DB...");
        await connectDB();
        console.log("GET /api/super-admin/pricing-models: DB Connected. Fetching models...");
        const models = await PricingModel.find({}).sort({ createdAt: -1 });
        console.log(`GET /api/super-admin/pricing-models: Found ${models.length} models`);
        return NextResponse.json(models);
    } catch (error) {
        console.error("GET /api/super-admin/pricing-models: Failed", error);
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
