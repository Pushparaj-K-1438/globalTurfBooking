import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import TaxRule from "../../../../../models/TaxRule";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const updated = await TaxRule.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) {
            return NextResponse.json({ error: "Tax rule not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update tax rule" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        await TaxRule.findByIdAndDelete(id);
        return NextResponse.json({ message: "Tax rule deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete tax rule" }, { status: 500 });
    }
}
