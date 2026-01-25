import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import TaxRule from "../../../../models/TaxRule";

export async function GET() {
    try {
        await connectDB();
        const taxRules = await TaxRule.find({}).sort({ country: 1, name: 1 });
        return NextResponse.json(taxRules);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tax rules" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, code, rate, country, state, category, isInclusive } = body;

        if (!name || !code || rate === undefined || !country) {
            return NextResponse.json({ error: "Name, code, rate, and country are required" }, { status: 400 });
        }

        const newTaxRule = await TaxRule.create({
            name, code, rate, country, state,
            category: category || 'service',
            isInclusive: isInclusive || false,
            isActive: true
        });

        return NextResponse.json(newTaxRule, { status: 201 });
    } catch (error) {
        console.error("Error creating tax rule:", error);
        return NextResponse.json({ error: "Failed to create tax rule" }, { status: 500 });
    }
}
