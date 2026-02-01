import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifySession } from "@/lib/session";

// GET - Get a single notification
export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const notification = await Notification.findOne({
            _id: id,
            tenantId: session.tenantId
        }).lean();

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Error fetching notification:", error);
        return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 });
    }
}

// PATCH - Mark notification as read
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, tenantId: session.tenantId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}

// DELETE - Delete a notification
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await verifySession(req);

        if (!session || !session.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const notification = await Notification.findOneAndDelete({
            _id: id,
            tenantId: session.tenantId
        });

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
    }
}
