import mongoose from 'mongoose';

const SubscriptionPlanSchema = new mongoose.Schema({
    // Plan Identity
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: String,

    // Pricing
    pricing: {
        monthly: {
            amount: Number,
            currency: { type: String, default: 'INR' }
        },
        yearly: {
            amount: Number,
            currency: { type: String, default: 'INR' },
            discount: Number // Percentage saved vs monthly
        },
        setup: {
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' }
        }
    },

    // Limits
    limits: {
        listings: { type: Number, default: 5 },          // Max listings
        bookingsPerMonth: { type: Number, default: 100 }, // Max bookings/month
        teamMembers: { type: Number, default: 3 },       // Max team members
        storage: { type: Number, default: 1024 },        // Storage in MB
        customDomain: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false },
        whiteLabeling: { type: Boolean, default: false },
        analytics: { type: String, enum: ['basic', 'advanced', 'premium'], default: 'basic' },
        support: { type: String, enum: ['community', 'email', 'priority', 'dedicated'], default: 'email' }
    },

    // Features
    features: [{
        name: String,
        included: Boolean,
        limit: mongoose.Schema.Types.Mixed // Can be number or 'unlimited'
    }],

    // Commission
    commissionRate: {
        type: Number,
        default: 5 // Percentage per booking
    },

    // Display
    badge: String, // e.g., "Popular", "Best Value"
    icon: String,
    color: String,
    displayOrder: { type: Number, default: 0 },

    // Visibility
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },

    // Trial
    trialDays: { type: Number, default: 14 },

    // Metadata
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

export default mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
