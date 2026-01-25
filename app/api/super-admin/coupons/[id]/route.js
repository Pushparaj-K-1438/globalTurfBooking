import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Coupon from "../../../../../models/Coupon";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }
        return NextResponse.json(coupon);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const updated = await Coupon.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        await Coupon.findByIdAndDelete(id);
        return NextResponse.json({ message: "Coupon deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
    }
}
