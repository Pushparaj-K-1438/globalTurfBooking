import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import { getGlobalAnalytics } from "../../../../lib/services/analytics";
import { authMiddleware, authorize } from "../../../../lib/middleware/auth";

export async function GET(req) {
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const forbidden = await authorize("SUPER_ADMIN")(user);
        if (forbidden) return NextResponse.json(forbidden, { status: 403 });

        const analytics = await getGlobalAnalytics();
        return NextResponse.json(analytics);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
