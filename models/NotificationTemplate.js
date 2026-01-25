import mongoose from "mongoose";

const notificationTemplateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        event: {
            type: String,
            required: true,
            enum: [
                'booking_created', 'booking_confirmed', 'booking_cancelled',
                'booking_reminder_24h', 'booking_reminder_1h', 'booking_completed',
                'payment_success', 'payment_failed', 'payment_refunded',
                'review_request', 'review_received', 'review_replied',
                'subscription_expiring', 'subscription_expired',
                'welcome', 'password_reset', 'account_verified',
                'tenant_approved', 'tenant_suspended',
                'custom'
            ]
        },
        channels: [{
            type: String,
            enum: ['email', 'sms', 'whatsapp', 'push', 'in_app']
        }],

        // Email template
        email: {
            subject: { type: String },
            htmlBody: { type: String },
            textBody: { type: String },
        },

        // SMS template
        sms: {
            body: { type: String, maxlength: 160 },
        },

        // WhatsApp template
        whatsapp: {
            templateId: { type: String }, // WhatsApp approved template ID
            body: { type: String },
        },

        // Push notification
        push: {
            title: { type: String },
            body: { type: String },
            icon: { type: String },
            action: { type: String }, // Deep link
        },

        // In-app notification
        inApp: {
            title: { type: String },
            body: { type: String },
            type: { type: String, enum: ['info', 'success', 'warning', 'error'] },
            actionUrl: { type: String },
        },

        // Template variables (for reference)
        variables: [{ type: String }], // ['{{booking_id}}', '{{customer_name}}']

        isGlobal: { type: Boolean, default: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const NotificationTemplate = mongoose.models.NotificationTemplate || mongoose.model("NotificationTemplate", notificationTemplateSchema);
export default NotificationTemplate;
