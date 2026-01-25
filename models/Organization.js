import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
    // Basic Info
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

    // Company Details
    industry: {
        type: String,
        enum: ['technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'hospitality', 'other']
    },
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']
    },
    website: String,
    description: String,

    // Contact
    primaryContact: {
        name: String,
        email: String,
        phone: String,
        designation: String
    },
    billingContact: {
        name: String,
        email: String,
        phone: String
    },

    // Address
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: { type: String, default: 'India' },
        pincode: String
    },

    // Tax Info
    taxInfo: {
        gstNumber: String,
        panNumber: String,
        taxExempt: { type: Boolean, default: false }
    },

    // Subscription
    subscription: {
        plan: {
            type: String,
            enum: ['trial', 'starter', 'professional', 'enterprise', 'custom'],
            default: 'trial'
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'suspended', 'cancelled'],
            default: 'active'
        },
        startDate: Date,
        endDate: Date,
        seats: { type: Number, default: 5 },
        features: [String],
        customPricing: mongoose.Schema.Types.Mixed
    },

    // Credits & Wallet
    wallet: {
        balance: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' }
    },

    // Settings
    settings: {
        allowedDomains: [String], // Email domains for SSO
        requireApproval: { type: Boolean, default: false },
        maxBookingAmount: Number,
        defaultPaymentMethod: String,
        invoicingEnabled: { type: Boolean, default: true },
        poNumberRequired: { type: Boolean, default: false }
    },

    // API Access
    apiAccess: {
        enabled: { type: Boolean, default: false },
        apiKey: String,
        rateLimit: { type: Number, default: 1000 }, // per hour
        webhookUrl: String
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'deleted'],
        default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Branding
    branding: {
        logo: String,
        primaryColor: String,
        secondaryColor: String
    },

    // Relationships
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
        department: String,
        joinedAt: { type: Date, default: Date.now }
    }],

    // Analytics
    stats: {
        totalBookings: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        activeMembers: { type: Number, default: 0 },
        lastBookingAt: Date
    },

    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
    notes: String
}, {
    timestamps: true
});

// Indexes
OrganizationSchema.index({ 'members.userId': 1 });
OrganizationSchema.index({ status: 1, 'subscription.status': 1 });

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
