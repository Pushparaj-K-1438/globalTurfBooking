import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Role from "../../../../../models/Role";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        const role = await Role.findById(id);
        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        if (role.isSystem) {
            return NextResponse.json({ error: "Cannot modify system role" }, { status: 403 });
        }

        const updated = await Role.findByIdAndUpdate(id, { $set: body }, { new: true });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;

        const role = await Role.findById(id);
        if (role?.isSystem) {
            return NextResponse.json({ error: "Cannot delete system role" }, { status: 403 });
        }

        await Role.findByIdAndDelete(id);
        return NextResponse.json({ message: "Role deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
    }
}
