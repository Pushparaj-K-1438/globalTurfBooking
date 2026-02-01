import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import { verifyPaymentSignature, fetchPayment } from "../../../../lib/razorpay";
import Booking from "../../../../models/booking";
import { sendBookingConfirmation } from "../../../../lib/email";

// POST - Verify payment and update booking status
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

        // Verify the payment signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json({
                success: false,
                error: "Payment verification failed. Invalid signature."
            }, { status: 400 });
        }

        // Fetch payment details from Razorpay
        const paymentResult = await fetchPayment(razorpay_payment_id);

        if (!paymentResult.success) {
            return NextResponse.json({
                success: false,
                error: "Failed to fetch payment details"
            }, { status: 500 });
        }

        const payment = paymentResult.payment;

        // Update booking with payment info
        if (bookingId) {
            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    paymentMethod: payment.method,
                    paymentId: razorpay_payment_id,
                    paidAmount: payment.amount / 100, // Convert from paise
                    $push: {
                        statusHistory: {
                            status: 'confirmed',
                            changedAt: new Date(),
                            reason: 'Payment received',
                            metadata: {
                                paymentId: razorpay_payment_id,
                                orderId: razorpay_order_id
                            }
                        }
                    }
                },
                { new: true }
            ).populate('listingId tenantId');

            if (booking) {
                // Send confirmation email (async - don't wait)
                sendBookingConfirmation(booking, booking.tenantId).catch(console.error);
            }

            return NextResponse.json({
                success: true,
                message: "Payment verified successfully",
                booking: {
                    id: booking?._id,
                    bookingId: booking?.bookingId,
                    status: 'confirmed'
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully",
            payment: {
                id: payment.id,
                amount: payment.amount / 100,
                status: payment.status,
                method: payment.method
            }
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json({
            success: false,
            error: "Payment verification failed"
        }, { status: 500 });
    }
}
