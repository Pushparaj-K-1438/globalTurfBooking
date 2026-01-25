import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Amenity from "../../../../../models/Amenity";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const updated = await Amenity.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) {
            return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update amenity" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        await Amenity.findByIdAndDelete(id);
        return NextResponse.json({ message: "Amenity deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete amenity" }, { status: 500 });
    }
}
