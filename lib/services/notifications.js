import Notification from "../../models/Notification";

export async function sendNotification({
    tenantId,
    userId,
    title,
    message,
    type = "info",
    channels = ["in-app"],
    metadata = {},
}) {
    // 1. Save to Database (In-App)
    const notification = await Notification.create({
        tenantId,
        userId,
        title,
        message,
        type,
        channel: channels.includes("in-app") ? "in-app" : channels[0],
        metadata,
    });

    // 2. Trigger External Channels
    if (channels.includes("email")) {
        console.log(`[Email] Sending to user ${userId}: ${title}`);
        // node-mailer or sendgrid logic here
    }

    if (channels.includes("whatsapp")) {
        console.log(`[WhatsApp] Sending to user ${userId}: ${message}`);
        // Twilio logic here
    }

    return notification;
}

export async function notifyBookingSuccess(booking) {
    return sendNotification({
        tenantId: booking.tenantId,
        userId: booking.userId, // assuming we have userId in booking or can fetch it
        title: "Booking Confirmed!",
        message: `Your booking ${booking.bookingId} for ${booking.date} has been confirmed.`,
        type: "booking",
        channels: ["in-app", "email"],
        metadata: { bookingId: booking.bookingId },
    });
}
