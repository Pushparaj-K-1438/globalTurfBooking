import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import PricingModel from "../../../../models/PricingModel";

export async function GET() {
    try {
        await connectDB();
        const models = await PricingModel.find({ isActive: true }).sort({ name: 1 });
        return NextResponse.json(models);
    } catch (error) {
        console.error("[API /listings/pricing-models] Error:", error);
        return NextResponse.json({ error: "Failed to fetch pricing models" }, { status: 500 });
    }
}
