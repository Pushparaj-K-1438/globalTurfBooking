import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import PricingModel from "../../../../../models/PricingModel";

// PUT: Update a pricing model
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const updatedModel = await PricingModel.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedModel) {
            return NextResponse.json({ error: "Pricing model not found" }, { status: 404 });
        }

        return NextResponse.json(updatedModel);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update pricing model" }, { status: 500 });
    }
}

// DELETE: Delete a pricing model
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        await PricingModel.findByIdAndDelete(id);
        return NextResponse.json({ message: "Pricing model deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete pricing model" }, { status: 500 });
    }
}
