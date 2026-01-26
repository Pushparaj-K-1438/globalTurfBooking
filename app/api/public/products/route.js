import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Product from "../../../../models/Product";
import Tenant from "../../../../models/Tenant";

export async function GET(req) {
    try {
        await connectDB();

        // Resolve tenant from host/subdomain usually, but here we might need to rely on query params or generic lookup if public
        // For now, assuming we filter by tenant if header/param exists, else return all (or restricted).
        // Since we are adding to a specific booking which has a listing -> tenant, we can pass tenantId param.

        const url = new URL(req.url);
        let tenantId = url.searchParams.get("tenantId");

        // If not provided in query, try to resolve from domain/subdomain
        if (!tenantId) {
            const { getTenant } = await import("../../../../lib/tenant");
            const tenant = await getTenant();
            if (tenant) tenantId = tenant._id;
        }

        // Enforce tenant isolation
        if (!tenantId) {
            return NextResponse.json([]); // Return empty list instead of specific error to be fail-safe for global view
        }

        const query = { isActive: true, tenantId };

        const products = await Product.find(query).sort({ isFeatured: -1, name: 1 });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
