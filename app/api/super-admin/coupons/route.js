import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Coupon from "../../../../models/Coupon";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const isGlobal = searchParams.get('global') === 'true';

        const query = isGlobal ? { isGlobal: true } : {};
        const coupons = await Coupon.find(query).sort({ createdAt: -1 });
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { code, name, discountType, discountValue, startDate, endDate } = body;

        if (!code || !name || !discountValue || !startDate || !endDate) {
            return NextResponse.json({ error: "Code, name, discount value, and validity dates are required" }, { status: 400 });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase(), isGlobal: true });
        if (existing) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const newCoupon = await Coupon.create({
            ...body,
            code: code.toUpperCase(),
            isGlobal: true,
            discountType: discountType || 'percentage',
            isActive: true
        });

        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}
