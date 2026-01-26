import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/mongoose";
import Product from "../../../../../models/Product";
import { authMiddleware, authorize } from "../../../../../lib/middleware/auth";

// GET: Single Product
export async function GET(req, props) {
    const params = await props.params;
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const product = await Product.findOne({ _id: params.id, tenantId: user.tenantId });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update Product
export async function PUT(req, props) {
    const params = await props.params;
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const isAuthorized = await authorize(["ADMIN", "SUPER_ADMIN"])(user);
        if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const data = await req.json();
        const product = await Product.findOneAndUpdate(
            { _id: params.id, tenantId: user.tenantId },
            data,
            { new: true }
        );

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove Product
export async function DELETE(req, props) {
    const params = await props.params;
    try {
        await connectDB();
        const { user, error, status } = await authMiddleware(req);
        if (error) return NextResponse.json({ error }, { status });

        const isAuthorized = await authorize(["ADMIN", "SUPER_ADMIN"])(user);
        if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const product = await Product.findOneAndDelete({ _id: params.id, tenantId: user.tenantId });

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
