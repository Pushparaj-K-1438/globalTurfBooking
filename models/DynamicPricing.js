import mongoose from "mongoose";

const dynamicPricingSchema = new mongoose.Schema(
    {
        listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },

        name: { type: String, required: true },
        ruleType: {
            type: String,
            enum: ['weekend', 'weekday', 'holiday', 'peak_season', 'off_season', 'last_minute', 'early_bird', 'demand_based'],
            required: true
        },

        // Conditions
        conditions: {
            // Day-based
            daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 6=Saturday

            // Date range
            startDate: { type: Date },
            endDate: { type: Date },

            // Time-based
            startTime: { type: String }, // "18:00"
            endTime: { type: String }, // "22:00"

            // Booking timing
            daysBeforeBooking: { type: Number }, // For early bird/last minute
            daysBeforeMax: { type: Number },

            // Occupancy-based
            minOccupancy: { type: Number }, // Percentage
            maxOccupancy: { type: Number },
        },

        // Price modification
        priceModifier: {
            type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
            value: { type: Number, required: true }, // Can be negative for discounts
            operation: { type: String, enum: ['add', 'subtract', 'multiply', 'set'], default: 'add' },
        },

        // For specific dates (holidays)
        specificDates: [{ type: Date }],
        holidayName: { type: String },

        priority: { type: Number, default: 0 }, // Higher priority rules apply first
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

dynamicPricingSchema.index({ listingId: 1, isActive: 1 });

const DynamicPricing = mongoose.models.DynamicPricing || mongoose.model("DynamicPricing", dynamicPricingSchema);
export default DynamicPricing;
