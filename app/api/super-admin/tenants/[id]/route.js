import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Tenant from "../../../../../models/Tenant";
import { authMiddleware, authorize } from "../../../../../lib/middleware/auth";

export async function PATCH(req, props) {
    const params = await props.params;
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const forbidden = await authorize("SUPER_ADMIN")(user);
        if (forbidden) return NextResponse.json(forbidden, { status: 403 });

        const body = await req.json();
        const { status: tenantStatus, modules, plan } = body;

        const tenant = await Tenant.findByIdAndUpdate(
            params.id,
            { $set: { status: tenantStatus, modules, plan } },
            { new: true }
        );

        if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

        return NextResponse.json(tenant);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
