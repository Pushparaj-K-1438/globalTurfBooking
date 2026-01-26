import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Tenant from "../../../../models/Tenant";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDB();

        // Fetch active tenants for public directory
        const tenants = await Tenant.find({ status: 'active' })
            .select('name slug settings.logo settings.theme.primaryColor modules')
            .limit(12)
            .lean();

        return NextResponse.json({ tenants });
    } catch (error) {
        console.error("Failed to fetch public tenants", error);
        return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 });
    }
}
