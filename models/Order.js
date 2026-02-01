import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true,
            sparse: true
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // Cart Items
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Alias
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
        shippingCost: { type: Number, default: 0 },
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

        // Order Status (extended for e-commerce)
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
            default: 'pending'
        },

        // Shipping Details
        trackingNumber: { type: String },
        shippedAt: { type: Date },
        deliveredAt: { type: Date },

        // Customer Info
        customerName: { type: String },
        customerEmail: { type: String },
        customerPhone: { type: String },
        customerDetails: {
            name: String,
            email: String,
            phone: String,
        },

        // Shipping/Billing Address
        shippingAddress: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            postalCode: { type: String },
            country: { type: String, default: 'India' }
        },

        // Coupon
        couponCode: { type: String },
        couponDiscount: { type: Number, default: 0 },

        // Notes
        customerNote: { type: String },
        adminNote: { type: String }
    },
    { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
