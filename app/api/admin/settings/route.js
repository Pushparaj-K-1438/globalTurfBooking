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
        const body = await req.json();
        const { settings, modules } = body;

        const updateData = {};
        if (settings) updateData.settings = settings;
        if (modules) updateData.modules = modules;

        const tenant = await Tenant.findByIdAndUpdate(
            session.tenantId,
            { $set: updateData },
            { new: true }
        );

        return NextResponse.json({
            settings: tenant.settings,
            modules: tenant.modules
        });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
