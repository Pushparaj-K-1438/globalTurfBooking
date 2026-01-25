import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        icon: { type: String, default: 'Check' }, // Lucide icon name
        category: { type: String, default: 'general' }, // general, sports, comfort, safety
        description: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Amenity = mongoose.models.Amenity || mongoose.model("Amenity", amenitySchema);
export default Amenity;
