import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import PolicyDocument from "../../../../models/PolicyDocument";
import { verifySession } from "../../../../lib/session";

// GET - Fetch policy documents
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const scope = searchParams.get('scope') || 'global';
        const tenantId = searchParams.get('tenantId');
        const status = searchParams.get('status') || 'published';

        const query = { status };

        if (type) query.type = type;
        if (scope === 'global') {
            query.scope = 'global';
        } else if (tenantId) {
            query.$or = [
                { scope: 'global' },
                { scope: 'tenant', tenantId }
            ];
        }

        const documents = await PolicyDocument.find(query)
            .select('type title slug version effectiveDate summary')
            .sort({ type: 1, effectiveDate: -1 })
            .lean();

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Error fetching policy documents:", error);
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}

// POST - Create new policy document (Super Admin only)
export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();

        const {
            type,
            title,
            content,
            summary,
            version,
            effectiveDate,
            requiresConsent,
            consentMessage,
            tenantId,
            scope = 'global'
        } = body;

        // Generate slug
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const document = new PolicyDocument({
            type,
            title,
            slug,
            content,
            summary,
            version: version || '1.0.0',
            effectiveDate: new Date(effectiveDate),
            requiresConsent,
            consentMessage,
            scope,
            tenantId: scope === 'tenant' ? tenantId : null,
            status: 'draft',
            createdBy: session.user.id
        });

        await document.save();

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error("Error creating policy document:", error);
        return NextResponse.json({ error: error.message || "Failed to create document" }, { status: 500 });
    }
}
