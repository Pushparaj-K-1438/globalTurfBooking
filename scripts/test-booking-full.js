const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Configuration
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://sanjuraj1438_db_user:6RgkXsfJ9AMUKiTy@cluster0.gbg4avg.mongodb.net/turfbooking?retryWrites=true&w=majority";
const API_URL = "http://localhost:3000/api/bookings";

// Schema definitions (Simplified for Test)
const tenantSchema = new mongoose.Schema({ name: String, slug: String, status: String, ownerId: ObjectId, plan: String }, { strict: false });
const listingSchema = new mongoose.Schema({ title: String, tenantId: ObjectId, priceConfig: Object, type: String }, { strict: false });
const productSchema = new mongoose.Schema({ name: String, tenantId: ObjectId, price: Number }, { strict: false });
const bookingSchema = new mongoose.Schema({ bookingId: String, totalAmount: Number, status: String }, { strict: false });

const Tenant = mongoose.model('Tenant', tenantSchema);
const Listing = mongoose.model('Listing', listingSchema);
const Product = mongoose.model('Product', productSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema); // Use existing if compiled

async function runTest() {
    console.log("🚀 Starting Booking System Validation Test...");

    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Setup Data
        const tenantId = new mongoose.Types.ObjectId();
        const listingId = new mongoose.Types.ObjectId();
        const productId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId(); // Dummy owner

        // Create Tenant
        await Tenant.deleteOne({ slug: 'test-auto-tenant' }); // Cleanup
        const tenant = await Tenant.create({
            _id: tenantId,
            name: "Test Auto Tenant",
            slug: "test-auto-tenant",
            status: "active",
            ownerId: userId,
            plan: "basic",
            modules: ["bookings", "products"]
        });
        console.log(`✅ Created Tenant: ${tenant.name} (${tenantId})`);

        // Create Listing
        const listing = await Listing.create({
            _id: listingId,
            tenantId: tenantId,
            title: "Test Turf Arena",
            type: "Turf",
            priceConfig: {
                basePrice: 1000,
                pricingModel: "per_hour",
                currency: "INR"
            },
            status: "published"
        });
        console.log(`✅ Created Listing: ${listing.title}`);

        // Create Product
        const product = await Product.create({
            _id: productId,
            tenantId: tenantId,
            name: "Test Water Bottle",
            price: 50,
            status: "active"
        });
        console.log(`✅ Created Product: ${product.name}`);

        // 2. Prepare Booking Payload (Matches Checkout Logic)
        const payload = {
            listingId: listingId.toString(),
            tenantId: tenantId.toString(),
            date: new Date().toISOString().split('T')[0], // Today
            timeSlots: ["10:00"],
            quantity: 1,
            customerInfo: {
                name: "Test User",
                email: "test@example.com",
                mobile: "9999999999" // Matches Schema requirement
            },
            addOns: [
                {
                    productId: productId.toString(),
                    quantity: 2 // 2 * 50 = 100
                }
            ]
        };

        console.log("\n📦 Sending Booking Request...", JSON.stringify(payload, null, 2));

        // 3. Execute API Call
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": tenantId.toString() // Force tenant context
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const data = await response.json();

        console.log(`\n📡 API Response Status: ${status}`);
        console.log("📡 API Response Body:", data);

        if (status === 201) {
            console.log("✅ Booking Created Successfully via API!");

            // Verify Calculations
            const expectedTotal = 1000 + (50 * 2); // 1100
            if (data.totalAmount === expectedTotal) {
                console.log(`✅ Price Calculation Verified: ₹${data.totalAmount}`);
            } else {
                console.error(`❌ Price Mismatch: Expected ${expectedTotal}, Got ${data.totalAmount}`);
            }

            // Verify Mobile Field
            if (data.mobile === "9999999999") {
                console.log("✅ Mobile Number Persisted Correctly");
            } else {
                console.error("❌ Mobile Number Mismatch/Missing");
            }

        } else {
            console.error("❌ Booking Failed via API");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🏁 Test Completed");
    }
}

runTest();
