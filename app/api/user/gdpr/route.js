import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import { verifySession } from "../../../../lib/session";
import { exportUserData, anonymizeUser, logAuditEvent } from "../../../../lib/security";

// GET - Export user's data (GDPR right to data portability)
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const userData = await exportUserData(session.user.id);

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Log the export
        await logAuditEvent({
            userId: session.user.id,
            action: 'export',
            resource: 'user',
            resourceId: session.user.id,
            status: 'success',
            metadata: { exportType: 'full' }
        });

        return NextResponse.json(userData);
    } catch (error) {
        console.error("Error exporting user data:", error);
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
    }
}

// DELETE - Anonymize user data (GDPR right to be forgotten)
export async function DELETE(req) {
    try {
        const session = await verifySession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const confirm = searchParams.get('confirm');

        if (confirm !== 'true') {
            return NextResponse.json({
                error: "Please confirm deletion by adding ?confirm=true",
                warning: "This action is irreversible. All your personal data will be anonymized."
            }, { status: 400 });
        }

        await anonymizeUser(session.user.id);

        return NextResponse.json({
            message: "Your data has been anonymized successfully",
            note: "You have been logged out and can no longer access this account"
        });
    } catch (error) {
        console.error("Error anonymizing user data:", error);
        return NextResponse.json({ error: "Failed to anonymize data" }, { status: 500 });
    }
}
