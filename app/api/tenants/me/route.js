import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import { getTenant } from "../../../../lib/tenant";

export async function GET() {
    try {
        await connectDB();
        const tenant = await getTenant();
        if (!tenant) return NextResponse.json({ success: false, message: "No tenant context" });
        return NextResponse.json(tenant);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
