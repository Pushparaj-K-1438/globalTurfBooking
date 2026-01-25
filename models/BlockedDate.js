import mongoose from "mongoose";

const blockedDateSchema = new mongoose.Schema(
    {
        listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },

        blockType: {
            type: String,
            enum: ['maintenance', 'renovation', 'private', 'holiday', 'other'],
            default: 'other'
        },

        // Block period
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        // For slot-based listings
        slots: [{
            startTime: String,
            endTime: String,
        }],
        allDay: { type: Boolean, default: true },

        // Recurring blocks
        isRecurring: { type: Boolean, default: false },
        recurringPattern: {
            frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
            interval: { type: Number, default: 1 },
            daysOfWeek: [{ type: Number }], // For weekly
            dayOfMonth: { type: Number }, // For monthly
        },

        reason: { type: String },
        notes: { type: String },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

blockedDateSchema.index({ listingId: 1, startDate: 1, endDate: 1 });

const BlockedDate = mongoose.models.BlockedDate || mongoose.model("BlockedDate", blockedDateSchema);
export default BlockedDate;
