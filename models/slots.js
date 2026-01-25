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
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      index: true
    },
    // For date-specific slots (optional - if null, applies to all dates)
    date: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate slots: same tenant + listing + time (+ date if specified)
slotSchema.index(
  { tenantId: 1, listingId: 1, startTime: 1, endTime: 1, date: 1 },
  { unique: true, partialFilterExpression: { date: { $exists: true } } }
);

// For slots without date
slotSchema.index(
  { tenantId: 1, listingId: 1, startTime: 1, endTime: 1 },
  { unique: true, partialFilterExpression: { date: { $exists: false } } }
);

export default mongoose.models.Slot || mongoose.model("Slot", slotSchema);
