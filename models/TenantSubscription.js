import mongoose from "mongoose";

const tenantSubscriptionSchema = new mongoose.Schema(
    {
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
        plan: {
            type: String,
            enum: ['free', 'basic', 'pro', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['trial', 'active', 'expired', 'cancelled'],
            default: 'trial'
        },
        trialDays: { type: Number, default: 14 },
        trialStartDate: { type: Date },
        trialEndDate: { type: Date },
        subscriptionStartDate: { type: Date },
        subscriptionEndDate: { type: Date },
        billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        commissionRate: { type: Number, default: 0 }, // Platform commission percentage
        features: {
            maxListings: { type: Number, default: 5 },
            maxBookingsPerMonth: { type: Number, default: 100 },
            customDomain: { type: Boolean, default: false },
            whiteLabel: { type: Boolean, default: false },
            analytics: { type: Boolean, default: false },
            apiAccess: { type: Boolean, default: false },
            prioritySupport: { type: Boolean, default: false },
            multipleStaff: { type: Boolean, default: false },
            maxStaff: { type: Number, default: 1 },
        },
        paymentHistory: [{
            amount: Number,
            currency: String,
            paymentDate: Date,
            paymentMethod: String,
            transactionId: String,
            status: String,
        }],
    },
    { timestamps: true }
);

tenantSubscriptionSchema.index({ tenantId: 1, status: 1 });

const TenantSubscription = mongoose.models.TenantSubscription || mongoose.model("TenantSubscription", tenantSubscriptionSchema);
export default TenantSubscription;
