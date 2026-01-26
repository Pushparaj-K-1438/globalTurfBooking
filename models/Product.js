import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true,
        },
        name: { type: String, required: true },
        slug: { type: String, unique: true },
        description: { type: String },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number }, // Original price for sales
        category: { type: String }, // e.g., 'Equipment', 'Apparel', 'Refreshment'
        images: [{
            url: String,
            alt: String,
            isPrimary: Boolean
        }],

        // Inventory
        stock: { type: Number, default: 0 },
        isTrackStock: { type: Boolean, default: true },
        sku: { type: String },

        // Status
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },

        // Metadata
        metadata: { type: Map, of: String },
    },
    { timestamps: true }
);

// Slug generation
productSchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }
    next();
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
