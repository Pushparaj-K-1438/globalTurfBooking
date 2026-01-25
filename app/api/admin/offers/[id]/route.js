import connectDB from "../../../../../lib/mongoose";
import Offer from "../../../../../models/offers";
import { getTenant } from "../../../../../lib/tenant";
import { NextResponse } from "next/server";

// GET /api/admin/offers/[id] - Get single offer
export async function GET(request, { params }) {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const offer = await Offer.findOne({ _id: params.id, tenantId: tenant._id });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ offer }, { status: 200 });
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

// PUT /api/admin/offers/[id] - Update offer
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const { name, description, minSlots, discountType, discountValue, validFrom, validUntil, isActive } = await request.json();

    const offer = await Offer.findOneAndUpdate(
      { _id: params.id, tenantId: tenant._id },
      { name, description, minSlots, discountType, discountValue, validFrom, validUntil, isActive },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Offer updated successfully", offer }, { status: 200 });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

// DELETE /api/admin/offers/[id] - Delete offer
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const offer = await Offer.findOneAndDelete({ _id: params.id, tenantId: tenant._id });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Offer deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
