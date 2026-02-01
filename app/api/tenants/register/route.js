import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Tenant from "../../../../models/Tenant";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, slug, email, password, mobile, businessType, modules } = body;

        // 1. Validation
        if (!name || !slug || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Check if slug or email exists
        const existingTenant = await Tenant.findOne({ slug });
        if (existingTenant) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });

        const existingUser = await User.findOne({ email });
        if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

        // 3. Pre-generate Tenant ID to satisfy User validation
        const tenantId = new mongoose.Types.ObjectId();
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create Tenant Owner
        const owner = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: "TENANT_OWNER",
            tenantId: tenantId,
            isActive: true,
        });

        // 5. Determine modules - use submitted modules or default based on business type
        const defaultModules = {
            turf: ["turfs", "bookings", "payments", "reviews", "coupons"],
            hotel: ["hotels", "bookings", "payments", "reviews", "coupons"],
            events: ["events", "bookings", "payments", "reviews", "coupons"],
            gym: ["gym", "bookings", "payments", "reviews"],
            wellness: ["wellness", "bookings", "payments", "reviews", "coupons"],
            ecommerce: ["products", "payments", "reviews", "coupons"],
            multi: ["bookings", "payments", "reviews", "coupons"],
        };

        const tenantModules = modules && Array.isArray(modules) && modules.length > 0
            ? modules
            : (defaultModules[businessType] || ["turfs", "bookings"]);

        // 6. Create Tenant
        const tenant = await Tenant.create({
            _id: tenantId,
            name,
            slug,
            ownerId: owner._id,
            status: "pending", // Requires Super Admin approval
            plan: "free",
            modules: tenantModules,
            settings: {
                businessType: businessType || 'turf'
            }
        });

        return NextResponse.json({
            success: true,
            message: "Registration successful. Please wait for Super Admin approval.",
            tenantId: tenant._id,
        }, { status: 201 });

    } catch (error) {
        console.error("Tenant Registration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
