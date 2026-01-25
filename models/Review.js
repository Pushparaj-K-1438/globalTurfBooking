import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
        listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Ratings
        overallRating: { type: Number, required: true, min: 1, max: 5 },
        ratings: {
            cleanliness: { type: Number, min: 1, max: 5 },
            facilities: { type: Number, min: 1, max: 5 },
            service: { type: Number, min: 1, max: 5 },
            valueForMoney: { type: Number, min: 1, max: 5 },
            location: { type: Number, min: 1, max: 5 },
        },

        // Review content
        title: { type: String, maxlength: 100 },
        comment: { type: String, maxlength: 2000 },
        images: [{ type: String }], // Review images
        videos: [{ type: String }], // Review videos

        // Moderation
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'flagged'],
            default: 'pending'
        },
        moderationNotes: { type: String },
        moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        moderatedAt: { type: Date },

        // AI analysis
        sentimentScore: { type: Number }, // -1 to 1
        toxicityScore: { type: Number }, // 0 to 1
        aiFlags: [{ type: String }], // ['spam', 'fake', 'inappropriate']

        // Tenant response
        tenantReply: {
            comment: { type: String, maxlength: 1000 },
            repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            repliedAt: { type: Date },
        },

        // Engagement
        helpfulCount: { type: Number, default: 0 },
        notHelpfulCount: { type: Number, default: 0 },
        reportCount: { type: Number, default: 0 },
        reports: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            reason: { type: String },
            reportedAt: { type: Date },
        }],

        // Verification
        isVerified: { type: Boolean, default: true }, // Verified booking = verified review
        isFeatured: { type: Boolean, default: false },

        // Weightage for average calculation
        weightage: { type: Number, default: 1 }, // Based on user history, booking value, etc.
    },
    { timestamps: true }
);

reviewSchema.index({ listingId: 1, status: 1 });
reviewSchema.index({ tenantId: 1, status: 1 });
reviewSchema.index({ userId: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
