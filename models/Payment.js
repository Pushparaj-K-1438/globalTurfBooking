import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        gatewayId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentGateway" },

        // Amount details
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        baseAmount: { type: Number }, // Original amount before conversion
        baseCurrency: { type: String },
        exchangeRate: { type: Number, default: 1 },

        // Tax breakdown
        subtotal: { type: Number },
        taxAmount: { type: Number, default: 0 },
        taxDetails: [{
            name: String,
            rate: Number,
            amount: Number,
        }],
        discountAmount: { type: Number, default: 0 },
        couponCode: { type: String },

        // Platform fees
        platformFee: { type: Number, default: 0 },
        platformFeePercentage: { type: Number, default: 0 },
        gatewayFee: { type: Number, default: 0 },
        netAmount: { type: Number }, // Amount after all deductions (tenant receives)

        // Payment info
        paymentMethod: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet', 'bnpl', 'bank_transfer', 'cash', 'manual'],
            default: 'card'
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
            default: 'pending'
        },

        // Gateway response
        gatewayOrderId: { type: String },
        gatewayPaymentId: { type: String },
        gatewaySignature: { type: String },
        gatewayResponse: { type: mongoose.Schema.Types.Mixed },

        // Refund info
        refunds: [{
            amount: Number,
            reason: String,
            refundId: String,
            status: String,
            refundedAt: Date,
            refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        }],
        totalRefunded: { type: Number, default: 0 },

        // Timestamps
        paidAt: { type: Date },
        failedAt: { type: Date },
        failureReason: { type: String },

        // Metadata
        ipAddress: { type: String },
        userAgent: { type: String },
        notes: { type: String },
    },
    { timestamps: true }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ tenantId: 1, status: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
