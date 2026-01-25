import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import { getTenantAnalytics } from "../../../../lib/services/analytics";
import { getTenant } from "../../../../lib/tenant";
import { authMiddleware, authorize } from "../../../../lib/middleware/auth";

export async function GET(req) {
    try {
        await connectDB();
        const tenant = await getTenant();
        if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const forbidden = await authorize("TENANT_OWNER", "TENANT_ADMIN")(user);
        if (forbidden) return NextResponse.json(forbidden, { status: 403 });

        const analytics = await getTenantAnalytics(tenant._id);
        return NextResponse.json(analytics);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
