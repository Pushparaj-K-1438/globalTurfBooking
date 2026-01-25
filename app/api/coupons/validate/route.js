import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Coupon from "../../../../models/Coupon";
import { verifySession } from "../../../../lib/session";

// POST: Validate and apply a coupon
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        const body = await req.json();
        const { code, orderValue, listingId, listingType, tenantId } = body;

        if (!code) {
            return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 });
        }

        // Find coupon - check both global and tenant-specific
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
            $or: [
                { isGlobal: true },
                { tenantId: tenantId }
            ]
        });

        if (!coupon) {
            return NextResponse.json({ valid: false, error: "Invalid or expired coupon" }, { status: 400 });
        }

        // Check usage limits
        if (coupon.totalUsageLimit && coupon.usedCount >= coupon.totalUsageLimit) {
            return NextResponse.json({ valid: false, error: "Coupon usage limit reached" }, { status: 400 });
        }

        // Check per-user limit
        if (session?.userId && coupon.perUserLimit) {
            const userUsage = coupon.usedBy?.filter(u => u.userId?.toString() === session.userId)?.length || 0;
            if (userUsage >= coupon.perUserLimit) {
                return NextResponse.json({ valid: false, error: "You've already used this coupon" }, { status: 400 });
            }
        }

        // Check minimum order value
        if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
            return NextResponse.json({
                valid: false,
                error: `Minimum order value of ₹${coupon.minOrderValue} required`
            }, { status: 400 });
        }

        // Check listing type restriction
        if (coupon.listingTypes?.length > 0 && listingType) {
            if (!coupon.listingTypes.includes(listingType)) {
                return NextResponse.json({
                    valid: false,
                    error: "Coupon not applicable for this listing type"
                }, { status: 400 });
            }
        }

        // Check specific listings restriction
        if (coupon.listingIds?.length > 0 && listingId) {
            if (!coupon.listingIds.map(id => id.toString()).includes(listingId)) {
                return NextResponse.json({
                    valid: false,
                    error: "Coupon not applicable for this listing"
                }, { status: 400 });
            }
        }

        // Check user type restriction
        if (coupon.applicableUserTypes?.length > 0 && !coupon.applicableUserTypes.includes('all')) {
            // TODO: Implement user type checking (new user, returning, etc.)
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderValue * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed order value
        discount = Math.min(discount, orderValue);

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                name: coupon.name,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discount: Math.round(discount * 100) / 100,
            finalAmount: Math.round((orderValue - discount) * 100) / 100,
        });

    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
    }
}
