import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true
    },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    timeSlots: [{ type: String, required: true }],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    appliedOffer: {
      offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
      name: { type: String },
      discountType: { type: String },
      discountValue: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);