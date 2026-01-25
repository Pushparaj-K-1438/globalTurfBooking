import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import DynamicPricing from "../../../../../models/DynamicPricing";
import { verifySession } from "../../../../../lib/session";

export async function PUT(req, { params }) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = params;
        const body = await req.json();

        const updated = await DynamicPricing.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { $set: body },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Pricing rule not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update pricing rule" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = params;
        await DynamicPricing.findOneAndDelete({ _id: id, tenantId: session.tenantId });
        return NextResponse.json({ message: "Pricing rule deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete pricing rule" }, { status: 500 });
    }
}
