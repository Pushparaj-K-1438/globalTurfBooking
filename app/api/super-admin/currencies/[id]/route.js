import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Currency from "../../../../../models/Currency";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        // If setting as base, unset other base currencies
        if (body.isBase) {
            await Currency.updateMany({ _id: { $ne: id } }, { isBase: false });
        }

        const updated = await Currency.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) {
            return NextResponse.json({ error: "Currency not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;

        const currency = await Currency.findById(id);
        if (currency?.isBase) {
            return NextResponse.json({ error: "Cannot delete base currency" }, { status: 400 });
        }

        await Currency.findByIdAndDelete(id);
        return NextResponse.json({ message: "Currency deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete currency" }, { status: 500 });
    }
}
