import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Slot from "../../../../models/Slot";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = params;

        const slot = await Slot.findById(id).populate('listingId', 'title location priceConfig');

        if (!slot) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }

        return NextResponse.json(slot);
    } catch (error) {
        console.error("Error fetching slot:", error);
        return NextResponse.json({ error: "Failed to fetch slot" }, { status: 500 });
    }
}
