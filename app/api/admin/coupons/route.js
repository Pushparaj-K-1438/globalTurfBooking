import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Coupon from "../../../../models/Coupon";
import { verifySession } from "../../../../lib/session";

// GET: Get tenant-specific coupons
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const coupons = await Coupon.find({ tenantId: session.tenantId }).sort({ createdAt: -1 });
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
    }
}

// POST: Create tenant coupon
export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { code, name, discountType, discountValue, startDate, endDate } = body;

        if (!code || !name || !discountValue || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase(), tenantId: session.tenantId });
        if (existing) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const newCoupon = await Coupon.create({
            ...body,
            code: code.toUpperCase(),
            tenantId: session.tenantId,
            isGlobal: false,
            isActive: true
        });

        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}
