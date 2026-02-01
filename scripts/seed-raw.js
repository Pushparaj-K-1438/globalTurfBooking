const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/turfbooking";

async function seed() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("Connected to MongoDB...");
        const db = client.db();

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        // 1. Super Admin
        let superAdmin = await db.collection('users').findOne({ email: "superadmin@test.com" });
        if (!superAdmin) {
            const result = await db.collection('users').insertOne({
                name: "Super Admin",
                email: "superadmin@test.com",
                password: hashedPassword,
                role: "SUPER_ADMIN",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            superAdmin = { _id: result.insertedId };
        }

        const tenants = [
            {
                name: "Elite Turf Arena",
                slug: "single-turf",
                type: "turf",
                modules: ["turfs", "bookings", "payments"],
                email: "owner1@test.com"
            },
            {
                name: "Grand Resort & Sports",
                slug: "resort-and-turf",
                type: "multi",
                modules: ["turfs", "hotels", "bookings", "payments", "reviews"],
                email: "owner2@test.com"
            },
            {
                name: "Sporty Gear Shop",
                slug: "ecommerce-store",
                type: "ecommerce",
                modules: ["products", "payments"],
                email: "owner3@test.com"
            },
            {
                name: "Mega Sports Hub",
                slug: "mega-hub",
                type: "multi",
                modules: ["turfs", "products", "bookings", "payments"],
                email: "owner4@test.com"
            }
        ];

        for (const t of tenants) {
            let tenant = await db.collection('tenants').findOne({ slug: t.slug });
            if (!tenant) {
                const result = await db.collection('tenants').insertOne({
                    name: t.name,
                    slug: t.slug,
                    ownerId: superAdmin._id,
                    status: "active",
                    plan: "pro",
                    modules: t.modules,
                    settings: {
                        businessType: t.type,
                        currency: "INR",
                        theme: { primaryColor: "#10b981" },
                        payment: { enabled: true, razorpayKeyId: "rzp_test_123" }
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                tenant = { _id: result.insertedId };

                await db.collection('users').insertOne({
                    name: `${t.name} Owner`,
                    email: t.email,
                    password: hashedPassword,
                    role: "TENANT_OWNER",
                    tenantId: tenant._id,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`Tenant created: ${t.name} (${t.email} / Admin@123)`);
            }
        }

        // Add some Products for Ecommerce
        const store = await db.collection('tenants').findOne({ slug: "ecommerce-store" });
        const mega = await db.collection('tenants').findOne({ slug: "mega-hub" });

        const products = [
            { name: "Professional Football", price: 999, category: "Equipment", tenantId: store._id },
            { name: "Running Shoes", price: 2499, category: "Apparel", tenantId: store._id },
            { name: "Cricket Bat (Kashmir Willow)", price: 1599, category: "Equipment", tenantId: mega._id }
        ];

        for (const p of products) {
            await db.collection('products').updateOne(
                { name: p.name, tenantId: p.tenantId },
                { $set: { ...p, isActive: true, createdAt: new Date() } },
                { upsate: true }
            );
        }

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

seed();
