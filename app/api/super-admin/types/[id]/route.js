import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import ListingType from "../../../../../models/ListingType";

// PUT: Update a type
export async function PUT(req, { params }) {
    await connectDB();
    try {
        const { id } = params;
        const body = await req.json();

        // Updates can include changing name, payable status, active status
        const updatedType = await ListingType.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedType) {
            return NextResponse.json({ error: "Type not found" }, { status: 404 });
        }

        return NextResponse.json(updatedType);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update type" }, { status: 500 });
    }
}

// DELETE: Soft delete (or toggle active)
export async function DELETE(req, { params }) {
    await connectDB();
    try {
        const { id } = params;
        await ListingType.findByIdAndDelete(id); // Or toggle isActive if we prefer soft delete
        return NextResponse.json({ message: "Type deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete type" }, { status: 500 });
    }
}
