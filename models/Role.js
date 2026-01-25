import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    resource: { type: String, required: true }, // e.g., "listings", "bookings", "users"
    actions: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete', 'manage']
    }]
});

const roleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        permissions: [permissionSchema],
        isSystem: { type: Boolean, default: false }, // System roles can't be deleted
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", default: null }, // null = global role
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Compound index for tenant-specific roles
roleSchema.index({ slug: 1, tenantId: 1 }, { unique: true });

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
export default Role;
