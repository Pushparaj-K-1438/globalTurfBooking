import connectDB from "../../../lib/mongose";
import Booking from "../../../models/booking";
import Slot from "../../../models/slots";
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from "../../../lib/email";
import { NextResponse } from "next/server";

// Function to generate a unique booking ID
async function generateBookingId() {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3-digit random number

  let bookingId;
  let isUnique = false;

  // Keep generating until we find a unique ID
  while (!isUnique) {
    bookingId = `BK${timestamp}${random}`;

    // Check if this booking ID already exists
    const existingBooking = await Booking.findOne({ bookingId });
    if (!existingBooking) {
      isUnique = true;
    } else {
      // If not unique, generate a new random number
      const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      bookingId = `BK${timestamp}${newRandom}`;
    }
  }

  return bookingId;
}

export async function POST(request) {
  try {
    await connectDB();

    const { name, mobile, email, date, timeSlots, originalAmount, discountAmount, finalAmount, appliedOffer } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!mobile) {
      return NextResponse.json({ error: "Mobile is required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    if (!timeSlots || timeSlots.length === 0) {
      return NextResponse.json({ error: "At least one time slot must be selected" }, { status: 400 });
    }

    // Validate each slot exists and is active
    const slotValidationPromises = timeSlots.map(async (timeSlot) => {
      const [startTime, endTime] = timeSlot.split(" - ");
      const slotInfo = await Slot.findOne({
        startTime,
        endTime,
        isActive: true
      });
      return { timeSlot, slotInfo };
    });

    const slotValidations = await Promise.all(slotValidationPromises);

    for (const { timeSlot, slotInfo } of slotValidations) {
      if (!slotInfo) {
        return NextResponse.json({ error: `Selected time slot "${timeSlot}" is not available or inactive` }, { status: 400 });
      }
    }

    // Check if any of the slots are already booked for this date
    const existingBookings = await Booking.find({ date });
    if (existingBookings.length > 0) {
      // Check each requested slot against all existing bookings
      for (const timeSlot of timeSlots) {
        const isBooked = existingBookings.some(booking =>
          booking.timeSlots && booking.timeSlots.includes(timeSlot)
        );
        if (isBooked) {
          return NextResponse.json({
            error: `The time slot "${timeSlot}" is already booked for the selected date`
          }, { status: 409 });
        }
      }
    }

    // Generate unique booking ID
    const bookingId = await generateBookingId();

    // Create a single booking record with multiple slots
    const booking = await Booking.create({
      bookingId,
      name,
      mobile,
      email,
      date,
      timeSlots,
      totalAmount: originalAmount,
      discountAmount,
      finalAmount,
      appliedOffer
    });

    // Send confirmation emails
    try {
      const bookingDetails = {
        date,
        timeSlots,
        mobile,
        bookingId,
        totalAmount: originalAmount,
        discountAmount,
        finalAmount
      };

      // Send email to user
      const userEmailResult = await sendBookingConfirmationEmail(email, name, bookingDetails);
      if (userEmailResult.success) {
        console.log(`User confirmation email sent successfully to ${email}`);
      } else {
        console.error(`Failed to send user confirmation email to ${email}:`, userEmailResult.error);
      }

      // Send email to admin
      const adminEmailResult = await sendAdminNotificationEmail('sanjuraj.1438@gmail.com', name, bookingDetails);
      if (adminEmailResult.success) {
        console.log('Admin notification email sent successfully');
      } else {
        console.error('Failed to send admin notification email:', adminEmailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      // Don't fail the booking if email sending fails
    }

    return NextResponse.json({
      message: `Your booking for ${timeSlots.length} slot(s) has been confirmed successfully.`,
      booking,
      bookingId,
      totalSlots: timeSlots.length
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}


export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    const bookings = await Booking.find({date});
    const bookedSlots = bookings.flatMap((b) => b.timeSlots || []);
    return NextResponse.json({ bookedSlots  }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
