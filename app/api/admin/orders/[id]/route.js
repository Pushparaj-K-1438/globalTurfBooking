import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import { verifySession } from "../../../../../lib/session";
import Order from "../../../../../models/Order";

// GET - Fetch single order by ID
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const order = await Order.findOne({
            _id: id,
            tenantId: session.tenantId
        }).populate("items.productId", "name price images");

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Fetch Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update order status
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { status, paymentStatus, trackingNumber } = body;

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;

        const order = await Order.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { $set: updateData },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Update Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Cancel/delete an order
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const order = await Order.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { $set: { status: 'cancelled' } },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Order cancelled successfully" }, { status: 200 });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
