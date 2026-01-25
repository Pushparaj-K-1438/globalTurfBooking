import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Review from "../../../../../models/Review";
import { verifySession } from "../../../../../lib/session";

// PUT: Reply to a review
export async function PUT(req, { params }) {
    try {
        const session = await verifySession(req);
        if (!session?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = params;
        const body = await req.json();
        const { replyComment } = body;

        const review = await Review.findOne({ _id: id, tenantId: session.tenantId });
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const updated = await Review.findByIdAndUpdate(
            id,
            {
                $set: {
                    'tenantReply.comment': replyComment,
                    'tenantReply.repliedBy': session.userId,
                    'tenantReply.repliedAt': new Date(),
                }
            },
            { new: true }
        );

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error replying to review:", error);
        return NextResponse.json({ error: "Failed to reply" }, { status: 500 });
    }
}
