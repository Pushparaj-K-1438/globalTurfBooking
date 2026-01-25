import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Slot from "../../../../models/Slot";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listingId');
        const date = searchParams.get('date');

        if (!listingId || !date) {
            return NextResponse.json({ error: "Listing ID and date are required" }, { status: 400 });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const slots = await Slot.find({
            listingId,
            date: { $gte: startOfDay, $lte: endOfDay },
        }).sort({ startTime: 1 });

        return NextResponse.json(slots);
    } catch (error) {
        console.error("Error fetching public slots:", error);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}
