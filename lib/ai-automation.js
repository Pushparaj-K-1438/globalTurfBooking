// AI & Automation Service
// Provides intelligent features for bookings, pricing, and customer support

import connectDB from './mongoose';

// ==================== SMART PRICING ENGINE ====================

/**
 * Calculate dynamic pricing based on demand, time, and other factors
 */
export async function calculateDynamicPrice({
    basePrice,
    listingId,
    date,
    slot,
    tenantId,
    options = {}
}) {
    const factors = [];
    let multiplier = 1.0;

    // 1. Day of Week Factor
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        multiplier *= 1.2; // 20% increase for weekends
        factors.push({ name: 'Weekend Premium', impact: '+20%' });
    }

    // 2. Time of Day Factor (Peak Hours)
    const hour = parseInt(slot?.startTime?.split(':')[0] || 12);
    if (hour >= 17 && hour <= 21) {
        multiplier *= 1.15; // 15% increase for evening peak
        factors.push({ name: 'Peak Hours', impact: '+15%' });
    } else if (hour >= 6 && hour <= 9) {
        multiplier *= 0.9; // 10% discount for early morning
        factors.push({ name: 'Early Bird', impact: '-10%' });
    }

    // 3. Holiday/Event Factor
    const isHoliday = await checkHoliday(date);
    if (isHoliday) {
        multiplier *= 1.25;
        factors.push({ name: 'Holiday Premium', impact: '+25%' });
    }

    // 4. Demand-Based Pricing
    const demandFactor = await calculateDemandFactor(listingId, date);
    if (demandFactor > 0.8) {
        multiplier *= 1.1;
        factors.push({ name: 'High Demand', impact: '+10%' });
    } else if (demandFactor < 0.3) {
        multiplier *= 0.85;
        factors.push({ name: 'Low Demand Discount', impact: '-15%' });
    }

    // 5. Advance Booking Discount
    const daysInAdvance = Math.floor((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysInAdvance >= 7) {
        multiplier *= 0.95;
        factors.push({ name: 'Advance Booking', impact: '-5%' });
    }

    // Calculate final price
    const dynamicPrice = Math.round(basePrice * multiplier);

    return {
        basePrice,
        dynamicPrice,
        multiplier: multiplier.toFixed(2),
        factors,
        savings: basePrice > dynamicPrice ? basePrice - dynamicPrice : 0,
        premium: dynamicPrice > basePrice ? dynamicPrice - basePrice : 0
    };
}

/**
 * Check if date is a holiday
 */
async function checkHoliday(date) {
    // List of Indian holidays (simplified)
    const holidays = [
        '01-26', // Republic Day
        '08-15', // Independence Day
        '10-02', // Gandhi Jayanti
        '12-25', // Christmas
    ];

    const dateStr = new Date(date).toISOString().slice(5, 10);
    return holidays.includes(dateStr);
}

/**
 * Calculate demand factor based on historical bookings
 */
async function calculateDemandFactor(listingId, date) {
    try {
        await connectDB();
        const Booking = (await import('../models/booking')).default;

        const dayOfWeek = new Date(date).getDay();

        // Get average bookings for this day of week
        const startOfMonth = new Date();
        startOfMonth.setDate(1);

        const bookings = await Booking.countDocuments({
            listingId,
            bookingDate: { $gte: startOfMonth },
            status: { $ne: 'CANCELLED' }
        });

        // Simplified demand calculation
        return Math.min(bookings / 30, 1); // Normalize to 0-1
    } catch {
        return 0.5; // Default to medium demand
    }
}

// ==================== SMART SLOT RECOMMENDATIONS ====================

/**
 * Get personalized slot recommendations for a user
 */
export async function getSmartSlotRecommendations({
    listingId,
    userId,
    date,
    preferences = {}
}) {
    await connectDB();

    const Slot = (await import('../models/slots')).default;
    const Booking = (await import('../models/booking')).default;

    // Get available slots
    const slots = await Slot.find({
        listingId,
        date: new Date(date),
        isAvailable: true
    }).lean();

    if (!slots.length) return [];

    // Score each slot
    const scoredSlots = await Promise.all(slots.map(async (slot) => {
        let score = 50; // Base score
        const reasons = [];

        // Time preference matching
        const hour = parseInt(slot.startTime.split(':')[0]);
        if (preferences.preferredTime === 'morning' && hour >= 6 && hour < 12) {
            score += 20;
            reasons.push('Matches your morning preference');
        } else if (preferences.preferredTime === 'evening' && hour >= 17 && hour <= 21) {
            score += 20;
            reasons.push('Matches your evening preference');
        }

        // Historical booking pattern
        if (userId) {
            const pastBookings = await Booking.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
            const preferredHours = pastBookings.map(b => parseInt(b.startTime?.split(':')[0] || 0));
            const avgHour = preferredHours.reduce((a, b) => a + b, 0) / preferredHours.length;
            if (Math.abs(hour - avgHour) < 2) {
                score += 15;
                reasons.push('Based on your booking history');
            }
        }

        // Price optimization
        const pricing = await calculateDynamicPrice({
            basePrice: slot.price,
            listingId,
            date,
            slot
        });
        if (pricing.savings > 0) {
            score += 10;
            reasons.push(`Save ₹${pricing.savings}`);
        }

        // Popularity (but not too crowded)
        return {
            ...slot,
            score,
            reasons,
            dynamicPrice: pricing.dynamicPrice
        };
    }));

    // Sort by score and return top recommendations
    return scoredSlots
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

// ==================== AUTOMATED RESPONSES ====================

/**
 * Generate automated response for common queries
 */
export function generateAutoResponse(query, context = {}) {
    const normalizedQuery = query.toLowerCase();

    const responses = {
        booking: {
            keywords: ['book', 'reserve', 'schedule', 'appointment'],
            response: `To make a booking, simply browse our venues and select your preferred date and time slot. You can book instantly and pay securely online. Would you like help finding a venue?`
        },
        cancellation: {
            keywords: ['cancel', 'refund', 'return'],
            response: `Our cancellation policy offers:\n• Full refund for cancellations 72+ hours before\n• 75% refund for 24-72 hours before\n• 50% refund for less than 24 hours\n\nYou can cancel from your "My Bookings" section.`
        },
        payment: {
            keywords: ['pay', 'payment', 'price', 'cost', 'fees'],
            response: `We accept UPI, credit/debit cards, and net banking. All payments are securely processed. Service fees are typically 5-10% of the booking amount.`
        },
        timing: {
            keywords: ['time', 'hours', 'open', 'close', 'available'],
            response: `Venue timings vary. Most venues are available from 6 AM to 11 PM. You can check specific availability on each venue's page.`
        },
        support: {
            keywords: ['help', 'support', 'contact', 'issue', 'problem'],
            response: `I'm here to help! For urgent issues, please contact our support team at support@bookit.com or call +91 98765 43210. We typically respond within 2 hours.`
        }
    };

    for (const [category, data] of Object.entries(responses)) {
        if (data.keywords.some(kw => normalizedQuery.includes(kw))) {
            return {
                matched: true,
                category,
                response: data.response,
                confidence: 0.8
            };
        }
    }

    return {
        matched: false,
        response: `I understand you need help. A support agent will assist you shortly. In the meantime, you can check our FAQ at /help or contact us at support@bookit.com.`,
        confidence: 0.3
    };
}

// ==================== BOOKING PREDICTIONS ====================

/**
 * Predict optimal times for venue owners to add more slots
 */
export async function predictDemand(listingId, days = 7) {
    await connectDB();

    const Booking = (await import('../models/booking')).default;

    // Analyze past bookings
    const pastMonth = new Date();
    pastMonth.setMonth(pastMonth.getMonth() - 1);

    const bookings = await Booking.find({
        listingId,
        createdAt: { $gte: pastMonth },
        status: { $ne: 'CANCELLED' }
    }).lean();

    // Calculate demand by day and hour
    const demandMap = {};
    bookings.forEach(booking => {
        const dayHour = `${new Date(booking.bookingDate).getDay()}-${booking.startTime?.split(':')[0] || 0}`;
        demandMap[dayHour] = (demandMap[dayHour] || 0) + 1;
    });

    // Find peak times
    const peakTimes = Object.entries(demandMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, count]) => {
            const [day, hour] = key.split('-');
            return {
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
                hour: `${hour}:00`,
                bookings: count
            };
        });

    return {
        peakTimes,
        suggestion: peakTimes.length > 0
            ? `Consider adding more slots on ${peakTimes[0].day} around ${peakTimes[0].hour}`
            : 'Not enough data to make predictions yet'
    };
}

// ==================== SMART NOTIFICATIONS ====================

/**
 * Determine if and when to send booking reminders
 */
export function getSmartReminderSchedule(booking) {
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);

    const reminders = [];

    // 24 hours before
    if (hoursUntilBooking > 24) {
        reminders.push({
            type: 'reminder_24h',
            sendAt: new Date(bookingDate - 24 * 60 * 60 * 1000),
            channel: ['email', 'push'],
            message: `Reminder: Your booking at ${booking.listingId?.title || 'venue'} is tomorrow!`
        });
    }

    // 2 hours before
    if (hoursUntilBooking > 2) {
        reminders.push({
            type: 'reminder_2h',
            sendAt: new Date(bookingDate - 2 * 60 * 60 * 1000),
            channel: ['sms', 'push'],
            message: `Your booking starts in 2 hours. See you soon!`
        });
    }

    // Follow-up after booking
    reminders.push({
        type: 'feedback_request',
        sendAt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
        channel: ['email'],
        message: `How was your experience? Please leave a review.`
    });

    return reminders;
}

export default {
    calculateDynamicPrice,
    getSmartSlotRecommendations,
    generateAutoResponse,
    predictDemand,
    getSmartReminderSchedule
};
