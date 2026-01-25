import { NextResponse } from "next/server";
import { calculateDynamicPrice, getSmartSlotRecommendations, predictDemand } from "../../../../lib/ai-automation";
import connectDB from "../../../../lib/mongoose";
import { verifySession } from "../../../../lib/session";

// GET - Get dynamic pricing for a slot
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listingId');
        const date = searchParams.get('date');
        const basePrice = parseFloat(searchParams.get('basePrice')) || 500;
        const startTime = searchParams.get('startTime');

        if (!listingId || !date) {
            return NextResponse.json({ error: "listingId and date are required" }, { status: 400 });
        }

        const pricing = await calculateDynamicPrice({
            basePrice,
            listingId,
            date,
            slot: { startTime }
        });

        return NextResponse.json(pricing);
    } catch (error) {
        console.error("Error calculating dynamic price:", error);
        return NextResponse.json({ error: "Failed to calculate price" }, { status: 500 });
    }
}

// POST - Get smart slot recommendations
export async function POST(req) {
    try {
        const session = await verifySession(req);
        const body = await req.json();
        const { listingId, date, preferences } = body;

        if (!listingId || !date) {
            return NextResponse.json({ error: "listingId and date are required" }, { status: 400 });
        }

        const recommendations = await getSmartSlotRecommendations({
            listingId,
            userId: session?.user?.id,
            date,
            preferences
        });

        return NextResponse.json({ recommendations });
    } catch (error) {
        console.error("Error getting recommendations:", error);
        return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
    }
}
