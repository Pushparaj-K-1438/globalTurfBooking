import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // For subdomains
    domain: { type: String, unique: true, sparse: true }, // For custom domains
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "expired"],
      default: "pending",
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium", "enterprise"],
      default: "free",
    },
    modules: [
      {
        type: String,
        enum: ["turfs", "hotels", "resorts", "events", "coworking", "payments", "coupons", "reviews", "notifications"],
      },
    ],
    settings: {
      theme: {
        primaryColor: { type: String, default: "#000000" },
        logo: { type: String },
      },
      currency: { type: String, default: "USD" },
      timezone: { type: String, default: "UTC" },
    },
    subscription: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 });

const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
export default Tenant;
