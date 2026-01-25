import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, uppercase: true },
        name: { type: String, required: true },
        description: { type: String },

        // Scope
        isGlobal: { type: Boolean, default: false }, // Platform-wide coupon
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }, // null if global
        listingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }], // Specific listings
        listingTypes: [{ type: String }], // Apply to specific listing types

        // Discount
        discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
        discountValue: { type: Number, required: true },
        maxDiscount: { type: Number }, // Cap for percentage discounts
        currency: { type: String, default: 'INR' }, // For flat discounts

        // Conditions
        minOrderValue: { type: Number, default: 0 },
        maxOrderValue: { type: Number },
        minBookingDuration: { type: Number }, // Minimum hours/days

        // Usage limits
        totalUsageLimit: { type: Number }, // Total times coupon can be used
        perUserLimit: { type: Number, default: 1 }, // Times per user
        usedCount: { type: Number, default: 0 },
        usedBy: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            usedAt: { type: Date },
            bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        }],

        // Validity
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        // User targeting
        applicableUserTypes: [{
            type: String,
            enum: ['all', 'new', 'returning', 'vip']
        }],
        specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        // Special types
        couponType: {
            type: String,
            enum: ['regular', 'referral', 'influencer', 'first_booking', 'seasonal', 'flash_sale'],
            default: 'regular'
        },
        referralConfig: {
            referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            referrerReward: { type: Number },
            referrerRewardType: { type: String, enum: ['percentage', 'flat'] },
        },

        isActive: { type: Boolean, default: true },
        isHidden: { type: Boolean, default: false }, // Hidden from public listing
    },
    { timestamps: true }
);

couponSchema.index({ code: 1, tenantId: 1 }, { unique: true });
couponSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;
