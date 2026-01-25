import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // Format: "HH:mm"
    endTime: { type: String, required: true },   // Format: "HH:mm"
    isActive: { type: Boolean, default: true },
    price: { type: Number, default: 400 },     // Price for this slot
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
  },
  { timestamps: true }
);

export default mongoose.models.Slot || mongoose.model("Slot", slotSchema);
