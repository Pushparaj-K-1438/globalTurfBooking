import connectDB from "../../../../lib/mongoose";
import Offer from "../../../../models/offers";
import { getTenant } from "../../../../lib/tenant";
import { NextResponse } from "next/server";

// GET /api/admin/offers - Get all offers
export async function GET() {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const offers = await Offer.find({ tenantId: tenant._id }).sort({ createdAt: -1 });
    return NextResponse.json({ offers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

// POST /api/admin/offers - Create new offer
export async function POST(request) {
  try {
    await connectDB();

    const { name, description, minSlots, discountType, discountValue, validFrom, validUntil, isActive } = await request.json();

    if (!name || !description || !minSlots || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json({ error: "Percentage discount must be between 0 and 100" }, { status: 400 });
    }

    if (discountType === 'fixed' && discountValue < 0) {
      return NextResponse.json({ error: "Fixed discount cannot be negative" }, { status: 400 });
    }

    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const offer = await Offer.create({
      name,
      description,
      minSlots,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      isActive: isActive !== undefined ? isActive : true,
      tenantId: tenant._id
    });

    return NextResponse.json({ message: "Offer created successfully", offer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
