import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import { createOrder, getKeyId } from "../../../../lib/razorpay";
import Booking from "../../../../models/booking";

// POST - Create a payment order for booking
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { bookingId, amount, type = 'booking' } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
        }

        // Generate unique receipt ID
        const receipt = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create Razorpay order
        const result = await createOrder(amount, 'INR', receipt, {
            bookingId,
            type,
            description: type === 'booking' ? 'Booking Payment' : 'Order Payment'
        });

        if (!result.success) {
            return NextResponse.json({
                error: result.error || "Failed to create payment order"
            }, { status: 500 });
        }

        // If bookingId provided, update booking with order info
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, {
                'payment.orderId': result.order.id,
                'payment.status': 'pending'
            });
        }

        return NextResponse.json({
            orderId: result.order.id,
            amount: result.order.amount,
            currency: result.order.currency,
            keyId: getKeyId()
        });
    } catch (error) {
        console.error("Error creating payment order:", error);
        return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
    }
}
