import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },

        // Action details
        action: { type: String, required: true }, // create, update, delete, login, logout
        resource: { type: String, required: true }, // listing, booking, user, payment
        resourceId: { type: mongoose.Schema.Types.ObjectId },

        // Change tracking
        previousData: { type: mongoose.Schema.Types.Mixed },
        newData: { type: mongoose.Schema.Types.Mixed },
        changes: [{
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
        }],

        // Request info
        ipAddress: { type: String },
        userAgent: { type: String },
        method: { type: String }, // GET, POST, PUT, DELETE
        path: { type: String },

        // Status
        status: { type: String, enum: ['success', 'failure'], default: 'success' },
        errorMessage: { type: String },

        // Metadata
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ tenantId: 1, resource: 1 });
auditLogSchema.index({ resourceId: 1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
