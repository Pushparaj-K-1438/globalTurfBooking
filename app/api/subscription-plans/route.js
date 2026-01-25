import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import SubscriptionPlan from "../../../../models/SubscriptionPlan";
import { verifySession } from "../../../../lib/session";

// Seed default subscription plans
const defaultPlans = [
    {
        name: "Starter",
        slug: "starter",
        description: "Perfect for small venues just getting started",
        pricing: {
            monthly: { amount: 999, currency: 'INR' },
            yearly: { amount: 9990, currency: 'INR', discount: 17 }
        },
        limits: {
            listings: 3,
            bookingsPerMonth: 100,
            teamMembers: 1,
            storage: 512,
            customDomain: false,
            apiAccess: false,
            whiteLabeling: false,
            analytics: 'basic',
            support: 'email'
        },
        commissionRate: 5,
        trialDays: 14,
        displayOrder: 1,
        isPublic: true,
        isActive: true
    },
    {
        name: "Professional",
        slug: "professional",
        description: "For growing businesses with multiple venues",
        pricing: {
            monthly: { amount: 2499, currency: 'INR' },
            yearly: { amount: 24990, currency: 'INR', discount: 17 }
        },
        limits: {
            listings: 10,
            bookingsPerMonth: -1, // unlimited
            teamMembers: 5,
            storage: 2048,
            customDomain: true,
            apiAccess: true,
            whiteLabeling: false,
            analytics: 'advanced',
            support: 'priority'
        },
        commissionRate: 3,
        badge: "Most Popular",
        trialDays: 14,
        displayOrder: 2,
        isPublic: true,
        isActive: true
    },
    {
        name: "Business",
        slug: "business",
        description: "For large organizations with advanced needs",
        pricing: {
            monthly: { amount: 4999, currency: 'INR' },
            yearly: { amount: 49990, currency: 'INR', discount: 17 }
        },
        limits: {
            listings: -1, // unlimited
            bookingsPerMonth: -1,
            teamMembers: -1,
            storage: 10240,
            customDomain: true,
            apiAccess: true,
            whiteLabeling: true,
            analytics: 'premium',
            support: 'dedicated'
        },
        commissionRate: 2,
        trialDays: 14,
        displayOrder: 3,
        isPublic: true,
        isActive: true
    },
    {
        name: "Enterprise",
        slug: "enterprise",
        description: "Custom solutions for enterprise clients",
        pricing: {
            monthly: { amount: 0, currency: 'INR' },
            yearly: { amount: 0, currency: 'INR' }
        },
        limits: {
            listings: -1,
            bookingsPerMonth: -1,
            teamMembers: -1,
            storage: -1,
            customDomain: true,
            apiAccess: true,
            whiteLabeling: true,
            analytics: 'premium',
            support: 'dedicated'
        },
        commissionRate: 0,
        trialDays: 30,
        displayOrder: 4,
        isPublic: true,
        isActive: true
    }
];

// GET - List all subscription plans
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const includeHidden = searchParams.get('includeHidden') === 'true';

        const query = { isActive: true };
        if (!includeHidden) {
            query.isPublic = true;
        }

        let plans = await SubscriptionPlan.find(query)
            .sort({ displayOrder: 1 })
            .lean();

        // Seed default plans if none exist
        if (plans.length === 0) {
            await SubscriptionPlan.insertMany(defaultPlans);
            plans = await SubscriptionPlan.find(query).sort({ displayOrder: 1 }).lean();
        }

        return NextResponse.json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }
}

// POST - Create new plan (Super Admin only)
export async function POST(req) {
    try {
        const session = await verifySession(req);
        if (session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();

        const plan = new SubscriptionPlan(body);
        await plan.save();

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error("Error creating plan:", error);
        return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 });
    }
}
