// Integrations Service
// Provides connectivity with external services like calendars, payments, and messaging

// ==================== CALENDAR INTEGRATION ====================

/**
 * Generate iCal (.ics) file content for a booking
 */
export function generateICalEvent(booking) {
    const startDate = new Date(`${booking.bookingDate}T${booking.startTime || '00:00'}`);
    const endDate = new Date(`${booking.bookingDate}T${booking.endTime || '01:00'}`);

    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BookIt//Booking Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:booking-${booking._id}@bookit.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${booking.listingId?.title || 'Booking'} - BookIt
DESCRIPTION:Booking ID: ${booking._id}\\nVenue: ${booking.listingId?.title}\\nAmount: ₹${booking.totalAmount}
LOCATION:${booking.listingId?.location?.address || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    return icsContent;
}

/**
 * Generate Google Calendar URL for adding event
 */
export function generateGoogleCalendarUrl(booking) {
    const startDate = new Date(`${booking.bookingDate}T${booking.startTime || '00:00'}`);
    const endDate = new Date(`${booking.bookingDate}T${booking.endTime || '01:00'}`);

    const formatForGoogle = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${booking.listingId?.title || 'Booking'} - BookIt`,
        dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`,
        details: `Booking ID: ${booking._id}\nVenue: ${booking.listingId?.title}\nAmount: ₹${booking.totalAmount}`,
        location: booking.listingId?.location?.address || '',
        ctz: 'Asia/Kolkata'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ==================== PAYMENT GATEWAY INTEGRATION ====================

/**
 * Initialize Razorpay payment
 */
export async function initializeRazorpayPayment({
    amount,
    currency = 'INR',
    bookingId,
    customerInfo,
    notes = {}
}) {
    // This would typically call your backend to create an order
    return {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        name: 'BookIt',
        description: `Booking #${bookingId}`,
        order_id: null, // Will be set by backend
        prefill: {
            name: customerInfo?.name || '',
            email: customerInfo?.email || '',
            contact: customerInfo?.phone || ''
        },
        notes: {
            bookingId,
            ...notes
        },
        theme: {
            color: '#10B981'
        }
    };
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Initialize Stripe payment
 */
export async function initializeStripePayment({
    amount,
    currency = 'inr',
    bookingId,
    customerEmail
}) {
    // This would typically call Stripe API
    return {
        mode: 'payment',
        line_items: [{
            price_data: {
                currency,
                product_data: {
                    name: `Booking #${bookingId}`,
                    description: 'BookIt Venue Booking'
                },
                unit_amount: amount * 100, // Stripe expects amount in smallest currency unit
            },
            quantity: 1
        }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation/${bookingId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
        customer_email: customerEmail,
        metadata: {
            bookingId
        }
    };
}

// ==================== EMAIL INTEGRATION ====================

/**
 * Send email via SendGrid
 */
export async function sendEmail({
    to,
    subject,
    htmlContent,
    textContent,
    templateId,
    dynamicData
}) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'noreply@bookit.com',
            name: 'BookIt'
        },
        subject,
        text: textContent,
        html: htmlContent
    };

    if (templateId) {
        msg.templateId = templateId;
        msg.dynamicTemplateData = dynamicData;
    }

    try {
        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        console.error('SendGrid error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS({
    to,
    body
}) {
    const twilio = require('twilio');
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

    try {
        const message = await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Twilio error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== WHATSAPP INTEGRATION ====================

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsApp({
    to,
    body,
    mediaUrl = null
}) {
    const twilio = require('twilio');
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

    try {
        const message = await client.messages.create({
            body,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${to}`,
            ...(mediaUrl && { mediaUrl: [mediaUrl] })
        });
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('WhatsApp error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== GOOGLE MAPS INTEGRATION ====================

/**
 * Get coordinates from address using Google Geocoding API
 */
export async function geocodeAddress(address) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.results?.[0]) {
            const location = data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formattedAddress: data.results[0].formatted_address
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Get distance between two points
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// ==================== WEBHOOK HANDLING ====================

/**
 * Process incoming webhooks from payment providers
 */
export async function processPaymentWebhook(provider, payload, signature) {
    switch (provider) {
        case 'razorpay':
            // Verify signature and process
            const crypto = require('crypto');
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
                .update(JSON.stringify(payload))
                .digest('hex');

            if (expectedSignature !== signature) {
                throw new Error('Invalid signature');
            }

            return {
                event: payload.event,
                paymentId: payload.payload?.payment?.entity?.id,
                orderId: payload.payload?.payment?.entity?.order_id,
                amount: payload.payload?.payment?.entity?.amount / 100
            };

        case 'stripe':
            // Stripe webhook processing
            return {
                event: payload.type,
                paymentIntentId: payload.data?.object?.id,
                amount: payload.data?.object?.amount / 100
            };

        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

export default {
    generateICalEvent,
    generateGoogleCalendarUrl,
    initializeRazorpayPayment,
    verifyRazorpaySignature,
    initializeStripePayment,
    sendEmail,
    sendSMS,
    sendWhatsApp,
    geocodeAddress,
    calculateDistance,
    processPaymentWebhook
};
