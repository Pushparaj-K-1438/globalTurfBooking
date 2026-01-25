import mongoose from "mongoose";

const paymentGatewaySchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Razorpay, Stripe, PayPal
        slug: { type: String, required: true, unique: true },
        provider: { type: String, required: true }, // razorpay, stripe, paypal
        isGlobal: { type: Boolean, default: false }, // Platform-wide gateway
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }, // null if global
        credentials: {
            apiKey: { type: String },
            apiSecret: { type: String },
            webhookSecret: { type: String },
            merchantId: { type: String },
        },
        supportedMethods: [{
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet', 'bnpl', 'bank_transfer']
        }],
        supportedCurrencies: [{ type: String }], // ['INR', 'USD']
        isLive: { type: Boolean, default: false }, // Live or test mode
        isApproved: { type: Boolean, default: false }, // Super admin approval
        isActive: { type: Boolean, default: true },
        priority: { type: Number, default: 0 }, // For fallback ordering
        fees: {
            percentageFee: { type: Number, default: 0 },
            flatFee: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
        },
    },
    { timestamps: true }
);

const PaymentGateway = mongoose.models.PaymentGateway || mongoose.model("PaymentGateway", paymentGatewaySchema);
export default PaymentGateway;
