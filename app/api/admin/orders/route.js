import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import { verifySession } from "../../../../lib/session";
import Order from "../../../../models/Order";

// GET - Fetch all orders for the tenant
export async function GET(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await Order.find({ tenantId: session.tenantId })
            .populate("items.productId", "name price images")
            .populate("items.product", "name price images")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create a new order
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { items, customerName, customerEmail, customerPhone, shippingAddress, totalAmount, subtotal } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
        }

        // Generate order ID
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Calculate subtotal if not provided
        const calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.total || item.price * (item.quantity || 1)), 0);

        const order = await Order.create({
            orderId,
            tenantId: session.tenantId,
            items,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            subtotal: calculatedSubtotal,
            totalAmount: totalAmount || calculatedSubtotal,
            status: "pending",
            paymentStatus: "pending"
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Create Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

