import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    minSlots: { type: Number, required: true },  // Minimum slots required for offer
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true }, // Percentage or fixed amount
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
  },
  { timestamps: true }
);

export default mongoose.models.Offer || mongoose.model("Offer", offerSchema);
