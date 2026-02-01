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
        enum: ["turfs", "hotels", "resorts", "events", "coworking", "payments", "coupons", "reviews", "notifications", "products", "gym", "wellness", "bookings"],
      },
    ],
    settings: {
      businessType: {
        type: String,
        enum: ["turf", "hotel", "events", "gym", "wellness", "ecommerce", "multi"],
        default: "turf"
      },
      theme: {
        primaryColor: { type: String, default: "#10b981" },
        secondaryColor: { type: String, default: "#0f172a" },
        logo: { type: String },
        favicon: { type: String },
      },
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      contact: {
        email: String,
        phone: String,
        address: String,
      },

      // Integration Settings
      payment: {
        razorpayKeyId: String,
        razorpayKeySecret: String,
        stripePublishableKey: String,
        stripeSecretKey: String,
        enabled: { type: Boolean, default: false }
      },
      sms: {
        provider: { type: String, default: "twilio" },
        apiKey: String,
        senderId: String,
        enabled: { type: Boolean, default: false }
      },
      email: {
        smtpHost: String,
        smtpPort: String,
        smtpUser: String,
        smtpPass: String,
        enabled: { type: Boolean, default: false }
      },
      whatsapp: {
        provider: { type: String, default: "meta" },
        phoneNumberId: String,
        accessToken: String,
        businessAccountId: String,
        enabled: { type: Boolean, default: false }
      },
      push: {
        provider: { type: String, default: "firebase" },
        projectId: String,
        privateKey: String,
        clientEmail: String,
        enabled: { type: Boolean, default: false }
      }
    },
    subscription: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
  },
  { timestamps: true, strict: false }
);

tenantSchema.index({ slug: 1 });

const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
export default Tenant;
