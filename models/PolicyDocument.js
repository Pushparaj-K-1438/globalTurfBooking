import mongoose from 'mongoose';

const PolicyDocumentSchema = new mongoose.Schema({
    // Type of document
    type: {
        type: String,
        required: true,
        enum: [
            'terms_of_service',
            'privacy_policy',
            'refund_policy',
            'cancellation_policy',
            'cookie_policy',
            'acceptable_use',
            'data_processing_agreement',
            'sla',
            'gdpr_notice',
            'custom'
        ],
        index: true
    },

    // Scope: global or tenant-specific
    scope: {
        type: String,
        enum: ['global', 'tenant'],
        default: 'global'
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        index: true
    },

    // Document details
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        index: true
    },

    // Content
    content: {
        type: String,
        required: true
    },
    summary: String,

    // Versioning
    version: {
        type: String,
        required: true,
        default: '1.0.0'
    },
    previousVersionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PolicyDocument'
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: Date,

    // Metadata
    effectiveDate: {
        type: Date,
        required: true
    },
    expiryDate: Date,

    // Consent tracking
    requiresConsent: {
        type: Boolean,
        default: false
    },
    consentMessage: String,

    // SEO
    metaTitle: String,
    metaDescription: String,

    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound unique index
PolicyDocumentSchema.index({ type: 1, tenantId: 1, version: 1 }, { unique: true });

export default mongoose.models.PolicyDocument || mongoose.model('PolicyDocument', PolicyDocumentSchema);
