import connectDB from "../../../../../lib/mongoose";
import Slot from "../../../../../models/slots";
import { getTenant } from "../../../../../lib/tenant";
import { NextResponse } from "next/server";

// GET /api/admin/slots/[id] - Get single slot
export async function GET(request, { params }) {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const slot = await Slot.findOne({ _id: params.id, tenantId: tenant._id });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({ slot }, { status: 200 });
  } catch (error) {
    console.error("Error fetching slot:", error);
    return NextResponse.json({ error: "Failed to fetch slot" }, { status: 500 });
  }
}

// PUT /api/admin/slots/[id] - Update slot
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const { startTime, endTime, price, isActive } = await request.json();

    const slot = await Slot.findOneAndUpdate(
      { _id: params.id, tenantId: tenant._id },
      { startTime, endTime, price, isActive },
      { new: true, runValidators: true }
    );

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Slot updated successfully", slot }, { status: 200 });
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}

// DELETE /api/admin/slots/[id] - Delete slot
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });

    const slot = await Slot.findOneAndDelete({ _id: params.id, tenantId: tenant._id });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Slot deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
