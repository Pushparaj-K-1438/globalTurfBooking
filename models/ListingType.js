import mongoose from "mongoose";

const listingTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        icon: { type: String, default: 'Box' }, // Name of the Lucide icon
        isPayable: { type: Boolean, default: false }, // If true, requires payment integration/setup
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const ListingType = mongoose.models.ListingType || mongoose.model("ListingType", listingTypeSchema);
export default ListingType;
