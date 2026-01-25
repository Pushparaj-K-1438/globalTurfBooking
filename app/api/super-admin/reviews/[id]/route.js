import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Review from "../../../../../models/Review";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();
        const { status, moderationNotes } = body;

        const updated = await Review.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    moderationNotes,
                    moderatedAt: new Date(),
                }
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        await Review.findByIdAndDelete(id);
        return NextResponse.json({ message: "Review deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}
