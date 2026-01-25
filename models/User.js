import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        mobile: { type: String },
        password: { type: String, required: true, select: false },
        role: {
            type: String,
            enum: ["SUPER_ADMIN", "TENANT_OWNER", "TENANT_ADMIN", "STAFF", "CUSTOMER"],
            default: "CUSTOMER",
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: function () {
                return this.role !== "SUPER_ADMIN";
            },
        },
        isActive: { type: Boolean, default: true },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
        lastLogin: { type: Date },
        metadata: { type: Map, of: String },
    },
    { timestamps: true }
);

// Optimize queries by tenant
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
