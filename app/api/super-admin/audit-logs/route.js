import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import AuditLog from "../../../../models/AuditLog";
import { verifySession } from "../../../../lib/session";

export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const skip = (page - 1) * limit;

        // Filters
        const action = searchParams.get('action');
        const resource = searchParams.get('resource');
        const userId = searchParams.get('userId');
        const tenantId = searchParams.get('tenantId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query = {};

        if (action) query.action = action;
        if (resource) query.resource = resource;
        if (userId) query.userId = userId;
        if (tenantId) query.tenantId = tenantId;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('userId', 'name email')
                .populate('tenantId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        // Get unique values for filters
        const [actions, resources] = await Promise.all([
            AuditLog.distinct('action'),
            AuditLog.distinct('resource')
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            filters: { actions, resources }
        });

    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}
