'use server';

import connectDB from '../../lib/mongose';
import Booking from '../../models/booking';

export async function getBookingsStats(timeframe = 'today') {
    try {
        await connectDB();
        console.log('Connected to database');
        
        const now = new Date();
        let startDate, endDate;

        switch(timeframe) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(5, 0, 0, 0); // 5:00 AM today
                endDate = new Date(now);
                endDate.setHours(23, 0, 0, 0); // 11:00 PM today
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay()); // Start of week
                startDate.setHours(5, 0, 0, 0); // 5:00 AM start of week
                endDate = new Date(now);
                endDate.setHours(23, 0, 0, 0); // 11:00 PM today
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(5, 0, 0, 0); // 5:00 AM start of month
                endDate = new Date(now);
                endDate.setHours(23, 0, 0, 0); // 11:00 PM today
                break;
            case 'all':
            default:
                startDate = new Date('2025-01-01T00:00:00+05:30'); // Start of current year
                startDate.setHours(5, 0, 0, 0); // 5:00 AM start of year
                endDate = new Date(now);
                endDate.setHours(23, 0, 0, 0); // 11:00 PM today
        }

        const formatDate = (date) => {
            return date.toISOString().replace('T', ' ').split('.')[0];
        };

        console.log(`Fetching bookings for ${timeframe} from ${formatDate(startDate)} to ${formatDate(endDate)}`);
        
        const query = {
            date: { 
                $gte: formatDate(startDate),
                $lte: formatDate(endDate)
            }
        };
        const count = await Booking.countDocuments(query);
        console.log('Query:', JSON.stringify(query, null, 2));
        console.log(`Found ${count} bookings for ${timeframe}`);
        
        return { 
            count,
            timeframe,
            success: true 
        };
    } catch (error) {
        console.error('Error in getBookingsStats:', error);
        return { 
            count: 0, 
            timeframe,
            success: false,
            error: error.message 
        };
    }
}
export async function deleteBooking(bookingId) {
    try {
        await connectDB();
        console.log(`Deleting booking with ID: ${bookingId}`);
        
        const result = await Booking.findByIdAndDelete(bookingId);
        
        if (!result) {
            console.error('Booking not found');
            return { success: false, error: 'Booking not found' };
        }
        
        console.log('Booking deleted successfully');
        return { success: true };
    } catch (error) {
        console.error('Error deleting booking:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

function formatDateLocal(date) {
    return date.toLocaleDateString("en-CA"); // gives YYYY-MM-DD in local timezone
}
export async function getTodaysBookings() {
    try {
        await connectDB();
        console.log('Connected to database for today\'s bookings');
        
        const today = new Date();
        today.setHours(5, 0, 0, 0); // 5:00 AM today (September 25, 2025)
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // 5:00 AM tomorrow

        // Format for YYYY-MM-DD to match database date format
        const todayStr = formatDateLocal(today); // e.g., "2025-09-25"

        console.log(`Fetching today's bookings for ${todayStr}`);
        
        const query = {
            date: { $gte: todayStr } // today + all future
        };

        // Use lean() to get plain JavaScript objects
        const bookings =  await Booking.find(query).lean().sort({ date: 1, timeSlot: 1 });

        // Convert non-serializable fields to plain values
        const serializedBookings = bookings.map(booking => ({
            ...booking,
            _id: booking._id.toString(), // Convert ObjectId to string
            date: booking.date, // Already a string in YYYY-MM-DD format
            createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
            updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
            __v: Number(booking.__v) // Ensure __v is a number
        }));

        console.log('Query:', JSON.stringify(query, null, 2));
        console.log(`Found ${serializedBookings.length} bookings for today`);
        
        return { 
            bookings: serializedBookings,
            success: true 
        };
    } catch (error) {
        console.error('Error in getTodaysBookings:', error);
        return { 
            bookings: [],
            success: false,
            error: error.message 
        };
    }
}