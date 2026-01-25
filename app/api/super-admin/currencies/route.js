import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import Currency from "../../../../models/Currency";

export async function GET() {
    try {
        await connectDB();
        const currencies = await Currency.find({}).sort({ code: 1 });
        return NextResponse.json(currencies);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { code, name, symbol, exchangeRate, decimalPlaces, isBase } = body;

        if (!code || !name || !symbol) {
            return NextResponse.json({ error: "Code, name, and symbol are required" }, { status: 400 });
        }

        const existing = await Currency.findOne({ code: code.toUpperCase() });
        if (existing) {
            return NextResponse.json({ error: "Currency already exists" }, { status: 400 });
        }

        // If setting as base, unset other base currencies
        if (isBase) {
            await Currency.updateMany({}, { isBase: false });
        }

        const newCurrency = await Currency.create({
            code: code.toUpperCase(), name, symbol,
            exchangeRate: exchangeRate || 1,
            decimalPlaces: decimalPlaces || 2,
            isBase: isBase || false,
            isActive: true
        });

        return NextResponse.json(newCurrency, { status: 201 });
    } catch (error) {
        console.error("Error creating currency:", error);
        return NextResponse.json({ error: "Failed to create currency" }, { status: 500 });
    }
}
