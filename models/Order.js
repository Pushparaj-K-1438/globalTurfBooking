import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Cart Items
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // If it's a booking
            name: String,
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 },
            total: Number,
            metadata: Map
        }],

        // Order Summary
        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },

        // Payment
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        },
        paymentMethod: { type: String }, // 'razorpay', 'stripe', 'cash'
        paymentId: { type: String },

        // Order Status
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'cancelled'],
            default: 'pending'
        },

        // Customer Info (Snapshot)
        customerDetails: {
            name: String,
            email: String,
            phone: String,
        },

        // Shipping/Billing (simplified for now)
        shippingAddress: { type: Map, of: String },
    },
    { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
