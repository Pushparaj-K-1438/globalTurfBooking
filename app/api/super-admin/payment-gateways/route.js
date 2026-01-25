import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import PaymentGateway from "../../../../models/PaymentGateway";

export async function GET() {
    try {
        await connectDB();
        const gateways = await PaymentGateway.find({ isGlobal: true }).sort({ priority: -1 });
        return NextResponse.json(gateways);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payment gateways" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, provider, credentials, supportedMethods, supportedCurrencies, isLive } = body;

        if (!name || !provider) {
            return NextResponse.json({ error: "Name and provider are required" }, { status: 400 });
        }

        const slug = name.toLowerCase().replace(/\s+/g, '_');

        const newGateway = await PaymentGateway.create({
            name, slug, provider,
            credentials: credentials || {},
            supportedMethods: supportedMethods || [],
            supportedCurrencies: supportedCurrencies || ['INR'],
            isLive: isLive || false,
            isGlobal: true,
            isApproved: true,
            isActive: true,
        });

        return NextResponse.json(newGateway, { status: 201 });
    } catch (error) {
        console.error("Error creating payment gateway:", error);
        return NextResponse.json({ error: "Failed to create payment gateway" }, { status: 500 });
    }
}
