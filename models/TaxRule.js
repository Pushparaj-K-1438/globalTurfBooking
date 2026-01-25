import mongoose from "mongoose";

const taxRuleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // GST, VAT, Sales Tax
        code: { type: String, required: true }, // GST18, VAT20
        rate: { type: Number, required: true }, // 18, 20 (percentage)
        country: { type: String, required: true }, // IN, US, UK
        state: { type: String }, // For state-level taxes
        category: { type: String, default: 'service' }, // service, goods, accommodation
        isInclusive: { type: Boolean, default: false }, // Tax included in price or added
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

taxRuleSchema.index({ country: 1, category: 1 });

const TaxRule = mongoose.models.TaxRule || mongoose.model("TaxRule", taxRuleSchema);
export default TaxRule;
