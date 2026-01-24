import connectDB from "../../../../lib/mongose";
import Slot from "../../../../models/slots";
import { NextResponse } from "next/server";

// GET /api/admin/slots - Get all slots
export async function GET() {
  try {
    await connectDB();
    const slots = await Slot.find({}).sort({ startTime: 1 });
    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

// POST /api/admin/slots - Create new slot
export async function POST(request) {
  try {
    await connectDB();

    const { startTime, endTime, price, isActive } = await request.json();

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Start time and end time are required" }, { status: 400 });
    }

    const slot = await Slot.create({
      startTime,
      endTime,
      price: price || 400,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({ message: "Slot created successfully", slot }, { status: 201 });
  } catch (error) {
    console.error("Error creating slot:", error);
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}
