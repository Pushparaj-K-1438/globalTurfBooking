import { NextResponse } from "next/server";
import { generateAutoResponse } from "../../../../lib/ai-automation";

// POST - Get automated chatbot response
export async function POST(req) {
    try {
        const body = await req.json();
        const { message, context } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const response = generateAutoResponse(message, context);

        return NextResponse.json({
            reply: response.response,
            matched: response.matched,
            category: response.category,
            confidence: response.confidence,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error generating response:", error);
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
}
