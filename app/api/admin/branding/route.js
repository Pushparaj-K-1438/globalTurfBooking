import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import TenantBranding from "../../../../models/TenantBranding";
import { verifySession } from "../../../../lib/session";

// GET: Get branding for current tenant
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        let branding = await TenantBranding.findOne({ tenantId: session.tenantId });

        // Return default if not set
        if (!branding) {
            branding = {
                tenantId: session.tenantId,
                primaryColor: '#10b981',
                secondaryColor: '#3b82f6',
                accentColor: '#f59e0b',
                backgroundColor: '#ffffff',
                textColor: '#1e293b',
                fontFamily: 'Inter',
            };
        }

        return NextResponse.json(branding);
    } catch (error) {
        console.error("Error fetching branding:", error);
        return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 });
    }
}

// PUT: Update branding
export async function PUT(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        const branding = await TenantBranding.findOneAndUpdate(
            { tenantId: session.tenantId },
            { $set: { ...body, tenantId: session.tenantId } },
            { new: true, upsert: true }
        );

        return NextResponse.json(branding);
    } catch (error) {
        console.error("Error updating branding:", error);
        return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
    }
}
