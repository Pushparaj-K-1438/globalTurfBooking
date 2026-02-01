import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/turfbooking";

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB...");

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        // 1. Create Super Admin
        const superAdminEmail = "superadmin@test.com";
        let superAdmin = await User.findOne({ email: superAdminEmail });

        if (!superAdmin) {
            superAdmin = await User.create({
                name: "Super Admin",
                email: superAdminEmail,
                password: hashedPassword,
                role: "SUPER_ADMIN",
                isActive: true
            });
            console.log("Super Admin created: superadmin@test.com / Admin@123");
        }

        // 2. Create Single Business Tenant (Turf Only)
        const tenant1Slug = "single-turf";
        let tenant1 = await Tenant.findOne({ slug: tenant1Slug });
        if (!tenant1) {
            tenant1 = await Tenant.create({
                name: "Elite Turf Arena",
                slug: tenant1Slug,
                ownerId: superAdmin._id,
                status: "active",
                plan: "basic",
                modules: ["turfs", "bookings", "payments"],
                settings: {
                    businessType: "turf",
                    currency: "INR",
                    payment: { enabled: true, razorpayKeyId: "rzp_test_123" }
                }
            });

            await User.create({
                name: "Turf Owner",
                email: "owner1@test.com",
                password: hashedPassword,
                role: "TENANT_OWNER",
                tenantId: tenant1._id,
                isActive: true
            });
            console.log("Single Business Tenant created: owner1@test.com / Admin@123");
        }

        // 3. Create Multi Business Tenant (Turf + Hotel)
        const tenant2Slug = "resort-and-turf";
        let tenant2 = await Tenant.findOne({ slug: tenant2Slug });
        if (!tenant2) {
            tenant2 = await Tenant.create({
                name: "Grand Resort & Sports",
                slug: tenant2Slug,
                ownerId: superAdmin._id,
                status: "active",
                plan: "premium",
                modules: ["turfs", "hotels", "bookings", "payments", "reviews"],
                settings: {
                    businessType: "multi",
                    currency: "INR",
                    payment: { enabled: true, razorpayKeyId: "rzp_test_456" }
                }
            });

            await User.create({
                name: "Multi Owner",
                email: "owner2@test.com",
                password: hashedPassword,
                role: "TENANT_OWNER",
                tenantId: tenant2._id,
                isActive: true
            });
            console.log("Multi Business Tenant created: owner2@test.com / Admin@123");
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
