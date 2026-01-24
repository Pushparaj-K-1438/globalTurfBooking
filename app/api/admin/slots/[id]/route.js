import connectDB from "../../../../../lib/mongose";
import Slot from "../../../../../models/slots";
import { NextResponse } from "next/server";

// GET /api/admin/slots/[id] - Get single slot
export async function GET(request, { params }) {
  try {
    await connectDB();
    const slot = await Slot.findById(params.id);

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

    const { startTime, endTime, price, isActive } = await request.json();

    const slot = await Slot.findByIdAndUpdate(
      params.id,
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

    const slot = await Slot.findByIdAndDelete(params.id);

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Slot deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
