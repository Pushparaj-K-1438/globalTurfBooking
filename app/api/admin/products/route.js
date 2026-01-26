import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Product from "../../../../models/Product";
import { authMiddleware, authorize } from "../../../../lib/middleware/auth";

// GET: List all products for the tenant
export async function GET(req) {
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        // Admin or Super Admin can view products
        // Standard users might view them via a public API, but this is the admin API
        const isAuthorized = await authorize(["ADMIN", "SUPER_ADMIN"])(user);
        if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const products = await Product.find({ tenantId: user.tenantId }).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(req) {
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const isAuthorized = await authorize(["ADMIN", "SUPER_ADMIN"])(user);
        if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const data = await req.json();

        const product = await Product.create({
            ...data,
            tenantId: user.tenantId,
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
