import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Tenant from "../../../../models/Tenant";
import { authMiddleware, authorize } from "../../../../lib/middleware/auth";

/**
 * GET: List all tenants (Super Admin only)
 */
export async function GET(req) {
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const forbidden = await authorize("SUPER_ADMIN")(user);
        if (forbidden) return NextResponse.json(forbidden, { status: 403 });

        const tenants = await Tenant.find().sort({ createdAt: -1 });
        return NextResponse.json(tenants);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST: Create a new tenant (Sign up)
 */
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, slug, ownerId } = body;

        const existing = await Tenant.findOne({ slug });
        if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });

        const tenant = await Tenant.create({
            name,
            slug,
            ownerId,
            status: "pending",
            modules: ["turfs"], // Default module
        });

        return NextResponse.json(tenant, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
