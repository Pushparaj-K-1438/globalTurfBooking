import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Organization from "../../../../models/Organization";
import { verifySession } from "../../../../lib/session";
import { generateSecureToken } from "../../../../lib/security";

// GET - List organizations (Super Admin) or get user's organization
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        if (session.user.role === 'SUPER_ADMIN') {
            // Super admin can see all organizations
            const [organizations, total] = await Promise.all([
                Organization.find()
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),
                Organization.countDocuments()
            ]);

            return NextResponse.json({
                organizations,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        // Regular user - get their organizations
        const organizations = await Organization.find({
            'members.userId': session.user.id
        }).lean();

        return NextResponse.json({ organizations });
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }
}

// POST - Create new organization
export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        const {
            name,
            industry,
            size,
            website,
            description,
            primaryContact,
            address,
            taxInfo
        } = body;

        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check if slug exists
        const existing = await Organization.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: "Organization name already taken" }, { status: 400 });
        }

        const organization = new Organization({
            name,
            slug,
            industry,
            size,
            website,
            description,
            primaryContact: {
                ...primaryContact,
                email: primaryContact?.email || session.user.email
            },
            address,
            taxInfo,
            members: [{
                userId: session.user.id,
                role: 'admin',
                joinedAt: new Date()
            }],
            subscription: {
                plan: 'trial',
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
                seats: 5
            },
            status: 'active'
        });

        await organization.save();

        return NextResponse.json(organization, { status: 201 });
    } catch (error) {
        console.error("Error creating organization:", error);
        return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 });
    }
}
