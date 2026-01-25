import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Role from "../../../../models/Role";

const createSlug = (text) => {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '_').replace(/[^\w\_]+/g, '').replace(/\_\_+/g, '_');
};

export async function GET() {
    try {
        await connectDB();
        const roles = await Role.find({}).sort({ createdAt: -1 });
        return NextResponse.json(roles);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, description, permissions, tenantId } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const slug = createSlug(name);

        const newRole = await Role.create({
            name, slug, description,
            permissions: permissions || [],
            tenantId: tenantId || null,
            isSystem: false,
            isActive: true
        });

        return NextResponse.json(newRole, { status: 201 });
    } catch (error) {
        console.error("Error creating role:", error);
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
}
