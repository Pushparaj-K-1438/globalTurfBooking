import { NextResponse } from "next/server";
import { verifySession } from "../../../../lib/session";

export async function GET(req) {
    const session = await verifySession(req);

    if (!session || !session.userId) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            userId: session.userId,
            role: session.role,
            email: session.email,
            tenantId: session.tenantId,
        }
    });
}
