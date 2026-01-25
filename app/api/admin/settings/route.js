import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Tenant from "../../../../models/Tenant";
import { verifySession } from "../../../../lib/session";

export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const tenant = await Tenant.findById(session.tenantId).select('settings modules');

        if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

        return NextResponse.json({ settings: tenant.settings || {}, modules: tenant.modules || [] });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const settings = await req.json();

        const tenant = await Tenant.findByIdAndUpdate(
            session.tenantId,
            { $set: { settings: settings } },
            { new: true }
        );

        return NextResponse.json(tenant.settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
