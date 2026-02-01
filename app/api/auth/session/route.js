import { NextResponse } from "next/server";
import { verifySession } from "../../../../lib/session";
import connectDB from "../../../../lib/mongoose";
import Tenant from "../../../../models/Tenant";

export async function GET(req) {
    const session = await verifySession(req);

    if (!session || !session.userId) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let tenant = null;
    if (session.tenantId) {
        await connectDB();
        tenant = await Tenant.findById(session.tenantId).select('name slug modules status plan settings').lean();
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            userId: session.userId,
            role: session.role,
            email: session.email,
            tenantId: session.tenantId,
        },
        tenant
    });
}
