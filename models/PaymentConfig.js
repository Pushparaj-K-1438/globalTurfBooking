import mongoose from "mongoose";

const paymentConfigSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true,
            unique: true,
        },
        gateway: {
            type: String,
            enum: ["stripe", "razorpay", "paypal", "paystack", "manual"],
            required: true,
        },
        config: {
            // Encrypted fields. We should use a helper to encrypt/decrypt these.
            apiKey: { type: String, required: true },
            secretKey: { type: String, required: true },
            merchantId: { type: String },
            webhookSecret: { type: String },
        },
        isApproved: { type: Boolean, default: false }, // Super Admin approval
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        commissionRate: { type: Number, default: 0 }, // Platform commission % for this tenant
        status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    },
    { timestamps: true }
);

const PaymentConfig = mongoose.models.PaymentConfig || mongoose.model("PaymentConfig", paymentConfigSchema);
export default PaymentConfig;
