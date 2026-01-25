import mongoose from "mongoose";

const tenantBrandingSchema = new mongoose.Schema(
    {
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, unique: true },
        logo: { type: String }, // URL to logo
        logoLight: { type: String }, // Light version for dark backgrounds
        favicon: { type: String },
        primaryColor: { type: String, default: '#10b981' }, // Emerald
        secondaryColor: { type: String, default: '#3b82f6' }, // Blue
        accentColor: { type: String, default: '#f59e0b' }, // Amber
        backgroundColor: { type: String, default: '#ffffff' },
        textColor: { type: String, default: '#1e293b' },
        fontFamily: { type: String, default: 'Inter' },
        customDomain: { type: String }, // booking.myhotel.com
        customDomainVerified: { type: Boolean, default: false },
        metaTitle: { type: String },
        metaDescription: { type: String },
        socialLinks: {
            facebook: String,
            instagram: String,
            twitter: String,
            linkedin: String,
            youtube: String,
        },
        customCSS: { type: String }, // Advanced customization
    },
    { timestamps: true }
);

const TenantBranding = mongoose.models.TenantBranding || mongoose.model("TenantBranding", tenantBrandingSchema);
export default TenantBranding;
