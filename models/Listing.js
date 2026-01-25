import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true,
        },
        title: { type: String, required: true },
        slug: { type: String },
        description: { type: String, required: true },
        shortDescription: { type: String, maxlength: 200 },

        // Type & Category
        type: { type: String, required: true }, // Dynamic from ListingType
        category: { type: String }, // sub-category like 'Football', 'Suite', 'Meeting Room'

        // Location
        location: {
            address: { type: String, required: true },
            city: { type: String },
            state: { type: String },
            country: { type: String, default: 'IN' },
            postalCode: { type: String },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number },
            },
        },

        // Media
        images: [{
            url: String,
            alt: String,
            isPrimary: Boolean,
        }],
        videos: [{ type: String }],
        virtualTourUrl: { type: String },

        // Amenities (dynamic from Amenity model)
        amenities: [{ type: String }],

        // Pricing
        priceConfig: {
            basePrice: { type: Number, required: true },
            currency: { type: String, default: "INR" },
            pricingModel: { type: String, default: "per_hour" }, // Dynamic from PricingModel
            weekendPrice: { type: Number },
            weekendPriceEnabled: { type: Boolean, default: false },
            taxInclusive: { type: Boolean, default: false },
        },

        // Availability
        availabilityConfig: {
            startTime: { type: String }, // "06:00"
            endTime: { type: String }, // "23:00"
            slotDuration: { type: Number, default: 60 }, // in minutes
            bufferTime: { type: Number, default: 0 }, // between bookings
            minAdvanceBooking: { type: Number, default: 0 }, // hours before booking
            maxAdvanceBooking: { type: Number, default: 30 }, // days in advance
            instantBooking: { type: Boolean, default: true },
        },

        // For hotels/villas
        checkInTime: { type: String }, // "14:00"
        checkOutTime: { type: String }, // "11:00"
        minStay: { type: Number, default: 1 }, // nights
        maxStay: { type: Number }, // nights

        // Capacity
        capacity: { type: Number },
        capacityUnit: { type: String, default: 'people' }, // people, cars, rooms
        totalUnits: { type: Number, default: 1 }, // number of courts, rooms, etc.

        // Rules & Policies
        rules: [{ type: String }],
        cancellationPolicy: {
            type: String,
            enum: ['flexible', 'moderate', 'strict', 'non_refundable'],
            default: 'moderate'
        },
        cancellationDetails: { type: String },

        // Ratings
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },

        // Status
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },

        // SEO
        metaTitle: { type: String },
        metaDescription: { type: String },

        // Metadata (flexible)
        metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

// Generate slug from title
listingSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});

listingSchema.index({ tenantId: 1, type: 1 });
listingSchema.index({ tenantId: 1, isActive: 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ averageRating: -1 });

const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
export default Listing;
