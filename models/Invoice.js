import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    // Identifiers
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },

    // Parties
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Invoice Type
    type: {
        type: String,
        enum: ['booking', 'subscription', 'credit_purchase', 'refund', 'custom'],
        required: true
    },

    // Billing Details
    billingAddress: {
        name: String,
        company: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        gstNumber: String,
        email: String,
        phone: String
    },

    // Line Items
    items: [{
        description: String,
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        taxRate: { type: Number, default: 18 }, // GST percentage
        taxAmount: Number,
        discount: { type: Number, default: 0 },
        total: Number,

        // Reference
        referenceType: String, // 'booking', 'subscription', etc.
        referenceId: mongoose.Schema.Types.ObjectId
    }],

    // Amounts
    subtotal: {
        type: Number,
        required: true
    },
    taxBreakdown: {
        cgst: Number,
        sgst: Number,
        igst: Number
    },
    totalTax: Number,
    discount: { type: Number, default: 0 },
    total: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },

    // Payment
    status: {
        type: String,
        enum: ['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paidAmount: { type: Number, default: 0 },
    paidAt: Date,
    paymentMethod: String,
    paymentReference: String,

    // Dates
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: Date,

    // Purchase Order
    poNumber: String,

    // Notes
    notes: String,
    internalNotes: String,

    // PDF
    pdfUrl: String,

    // Reminders
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: Date,

    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ organizationId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, createdAt: -1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });

// Generate invoice number
InvoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await this.constructor.countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
