import mongoose from 'mongoose';

const UserConsentSchema = new mongoose.Schema({
    // User who gave consent
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Tenant context
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        index: true
    },

    // Policy document consented to
    policyDocumentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PolicyDocument',
        required: true
    },
    policyType: {
        type: String,
        required: true
    },
    policyVersion: {
        type: String,
        required: true
    },

    // Consent details
    consentGiven: {
        type: Boolean,
        required: true
    },
    consentMethod: {
        type: String,
        enum: ['checkbox', 'click', 'signature', 'email', 'api'],
        required: true
    },

    // Where consent was given
    consentSource: {
        type: String,
        enum: ['registration', 'checkout', 'settings', 'popup', 'email', 'api'],
        required: true
    },

    // Request context at time of consent
    ipAddress: String,
    userAgent: String,

    // Consent text shown to user
    consentText: String,

    // Withdrawal
    isWithdrawn: {
        type: Boolean,
        default: false
    },
    withdrawnAt: Date,
    withdrawalReason: String,

    // Timestamps
    consentedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Indexes
UserConsentSchema.index({ userId: 1, policyType: 1 });
UserConsentSchema.index({ consentedAt: -1 });

export default mongoose.models.UserConsent || mongoose.model('UserConsent', UserConsentSchema);
