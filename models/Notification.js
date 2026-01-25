import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },

        // Content
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error', 'booking', 'payment', 'review', 'system'],
            default: 'info'
        },

        // Related entities
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

        // Channels sent
        channels: [{
            channel: { type: String, enum: ['email', 'sms', 'whatsapp', 'push', 'in_app'] },
            sentAt: { type: Date },
            status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'] },
            errorMessage: { type: String },
        }],

        // Action
        actionUrl: { type: String },
        actionLabel: { type: String },

        // Status
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
        isArchived: { type: Boolean, default: false },

        // Scheduling
        scheduledFor: { type: Date },
        expiresAt: { type: Date },

        // Metadata
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;
