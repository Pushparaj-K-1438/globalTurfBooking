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
    date: { type: Date, required: true },
    timeSlots: [{ type: String }],
    duration: { type: Number }, // Duration in minutes
    guests: { type: Number, default: 1 },

    // Pricing
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },

    // Status Management
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'],
      default: 'pending'
    },
    statusHistory: [{
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String
    }],

    // Payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    paymentMethod: String,
    paymentId: String,
    paidAmount: { type: Number, default: 0 },

    // References
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Offer/Coupon Applied
    appliedOffer: {
      offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
      name: String,
      discountType: String,
      discountValue: Number,
    },
    appliedCoupon: {
      code: String,
      discountType: String,
      discountValue: Number
    },

    // Add-ons
    addOns: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      total: Number
    }],

    // Tracking
    source: {
      type: String,
      enum: ['website', 'mobile_app', 'walk_in', 'phone', 'admin'],
      default: 'website'
    },
    notes: String,
    adminNotes: String,

    // Cancellation
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,

    // Check-in/out
    checkedInAt: Date,
    checkedOutAt: Date,

    // Reminder sent
    reminderSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

bookingSchema.index({ tenantId: 1, bookingId: 1 }, { unique: true });
bookingSchema.index({ tenantId: 1, date: 1 });
bookingSchema.index({ tenantId: 1, status: 1 });
bookingSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
