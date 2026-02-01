import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifySession } from "@/lib/session";

// POST - Mark all notifications as read
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await Notification.updateMany(
            { tenantId: session.tenantId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        return NextResponse.json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}
