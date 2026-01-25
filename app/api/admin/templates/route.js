import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import NotificationTemplate from "../../../../models/NotificationTemplate";
import { verifySession } from "../../../../lib/session";

export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const templates = await NotificationTemplate.find({ tenantId: session.tenantId });
        return NextResponse.json(templates);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        await connectDB();

        const template = await NotificationTemplate.create({ ...body, tenantId: session.tenantId });
        return NextResponse.json(template);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }
}
