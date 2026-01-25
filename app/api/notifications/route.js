import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Notification from "../../../../models/Notification";
import { verifySession } from "../../../../lib/session";

// GET: Get notifications for current user
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit')) || 20;

        const query = { userId: session.userId, isArchived: false };
        if (unreadOnly) query.isRead = false;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            userId: session.userId,
            isRead: false,
            isArchived: false
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

// PUT: Mark notifications as read
export async function PUT(req) {
    try {
        const session = await verifySession(req);
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { notificationId, markAllRead } = body;

        if (markAllRead) {
            await Notification.updateMany(
                { userId: session.userId, isRead: false },
                { $set: { isRead: true, readAt: new Date() } }
            );
            return NextResponse.json({ success: true, message: "All marked as read" });
        }

        if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: session.userId },
                { $set: { isRead: true, readAt: new Date() } }
            );
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error) {
        console.error("Error updating notifications:", error);
        return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }
}

// DELETE: Archive/delete notification
export async function DELETE(req) {
    try {
        const session = await verifySession(req);
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const notificationId = searchParams.get('id');

        if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, userId: session.userId },
                { $set: { isArchived: true } }
            );
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
    }
}
