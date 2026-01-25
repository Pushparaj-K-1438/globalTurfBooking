import mongoose from "mongoose";

const pricingModelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // Display name like "Per Hour"
        slug: { type: String, required: true, unique: true }, // System value like "per_hour"
        description: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const PricingModel = mongoose.models.PricingModel || mongoose.model("PricingModel", pricingModelSchema);
export default PricingModel;
