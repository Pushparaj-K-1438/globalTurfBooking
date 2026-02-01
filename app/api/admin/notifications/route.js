import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifySession } from "@/lib/session";

// GET - Fetch notifications for the current admin
export async function GET(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        const query = { tenantId: session.tenantId };

        if (unreadOnly) {
            query.isRead = false;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Notification.countDocuments(query),
            Notification.countDocuments({ tenantId: session.tenantId, isRead: false })
        ]);

        return NextResponse.json({
            notifications,
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

// POST - Create a new notification
export async function POST(req) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, message, type, actionUrl, actionLabel, metadata, userId } = body;

        if (!title || !message) {
            return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
        }

        const notification = await Notification.create({
            tenantId: session.tenantId,
            userId: userId || session.userId,
            title,
            message,
            type: type || 'info',
            actionUrl,
            actionLabel,
            metadata,
            isRead: false
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error("Error creating notification:", error);
        return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
    }
}
