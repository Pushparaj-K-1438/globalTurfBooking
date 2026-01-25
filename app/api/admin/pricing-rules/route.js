import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import DynamicPricing from "../../../../models/DynamicPricing";
import { verifySession } from "../../../../lib/session";

// GET: Get pricing rules for tenant
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get('listingId');

        const query = { tenantId: session.tenantId };
        if (listingId) query.listingId = listingId;

        const pricingRules = await DynamicPricing.find(query)
            .populate('listingId', 'title')
            .sort({ priority: -1, createdAt: -1 });

        return NextResponse.json(pricingRules);
    } catch (error) {
        console.error("Error fetching pricing rules:", error);
        return NextResponse.json({ error: "Failed to fetch pricing rules" }, { status: 500 });
    }
}

// POST: Create pricing rule
export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { listingId, name, ruleType, conditions, priceModifier, specificDates, holidayName, priority } = body;

        if (!listingId || !name || !ruleType) {
            return NextResponse.json({ error: "Listing, name, and rule type are required" }, { status: 400 });
        }

        const rule = await DynamicPricing.create({
            listingId,
            tenantId: session.tenantId,
            name,
            ruleType,
            conditions: conditions || {},
            priceModifier: priceModifier || { type: 'percentage', value: 0, operation: 'add' },
            specificDates,
            holidayName,
            priority: priority || 0,
            isActive: true,
        });

        return NextResponse.json(rule, { status: 201 });
    } catch (error) {
        console.error("Error creating pricing rule:", error);
        return NextResponse.json({ error: "Failed to create pricing rule" }, { status: 500 });
    }
}
