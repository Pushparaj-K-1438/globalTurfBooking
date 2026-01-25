import { NextResponse } from "next/server";
import { generateICalEvent, generateGoogleCalendarUrl } from "../../../../lib/integrations";
import connectDB from "../../../../lib/mongoose";
import Booking from "../../../../models/booking";
import { verifySession } from "../../../../lib/session";

// GET - Generate calendar file for a booking
export async function GET(req) {
    try {
        const session = await verifySession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get('bookingId');
        const format = searchParams.get('format') || 'ical';

        if (!bookingId) {
            return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
        }

        await connectDB();

        const booking = await Booking.findById(bookingId)
            .populate('listingId', 'title location')
            .lean();

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Verify ownership
        if (booking.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        if (format === 'google') {
            const url = generateGoogleCalendarUrl(booking);
            return NextResponse.json({ url });
        }

        // iCal format
        const icsContent = generateICalEvent(booking);

        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar',
                'Content-Disposition': `attachment; filename="booking-${bookingId}.ics"`
            }
        });
    } catch (error) {
        console.error("Error generating calendar:", error);
        return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 });
    }
}
