import Notification from '../models/Notification';
import NotificationTemplate from '../models/NotificationTemplate';
import connectDB from './mongoose';

// Notification service for sending multi-channel notifications

export async function sendNotification({
    userId,
    tenantId,
    type,
    title,
    message,
    channels = ['in_app'],
    bookingId,
    listingId,
    paymentId,
    actionUrl,
    actionLabel,
    metadata
}) {
    await connectDB();

    const notification = await Notification.create({
        userId,
        tenantId,
        title,
        message,
        type,
        channels: channels.map(channel => ({ channel, status: 'pending' })),
        bookingId,
        listingId,
        paymentId,
        actionUrl,
        actionLabel,
        metadata,
    });

    // Send through each channel
    for (const channel of channels) {
        try {
            switch (channel) {
                case 'email':
                    await sendEmail({ to: userId, title, message });
                    break;
                case 'sms':
                    await sendSMS({ to: userId, message });
                    break;
                case 'push':
                    await sendPush({ userId, title, message });
                    break;
                case 'in_app':
                    // Already stored in DB
                    break;
            }

            // Update channel status
            await Notification.updateOne(
                { _id: notification._id, 'channels.channel': channel },
                { $set: { 'channels.$.status': 'sent', 'channels.$.sentAt': new Date() } }
            );
        } catch (error) {
            console.error(`Failed to send ${channel} notification:`, error);
            await Notification.updateOne(
                { _id: notification._id, 'channels.channel': channel },
                { $set: { 'channels.$.status': 'failed', 'channels.$.errorMessage': error.message } }
            );
        }
    }

    return notification;
}

// Send notification using a template
export async function sendTemplatedNotification({
    event,
    userId,
    tenantId,
    data = {},
    channels
}) {
    await connectDB();

    // Find the template
    let template = await NotificationTemplate.findOne({
        event,
        isActive: true,
        $or: [{ tenantId }, { isGlobal: true }]
    }).sort({ isGlobal: 1 }); // Prefer tenant-specific over global

    if (!template) {
        console.error(`No template found for event: ${event}`);
        return null;
    }

    // Replace variables in template
    const replaceVariables = (text) => {
        if (!text) return '';
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
    };

    return sendNotification({
        userId,
        tenantId,
        type: getTypeFromEvent(event),
        title: replaceVariables(template.inApp?.title || template.email?.subject || event),
        message: replaceVariables(template.inApp?.body || template.sms?.body || ''),
        channels: channels || template.channels || ['in_app'],
        actionUrl: replaceVariables(template.inApp?.actionUrl),
        metadata: data,
    });
}

function getTypeFromEvent(event) {
    if (event.includes('booking')) return 'booking';
    if (event.includes('payment')) return 'payment';
    if (event.includes('review')) return 'review';
    return 'info';
}

// Placeholder functions - implement based on your email/SMS providers
async function sendEmail({ to, title, message }) {
    // TODO: Implement with SendGrid, Nodemailer, etc.
    console.log(`[EMAIL] To: ${to}, Subject: ${title}`);
}

async function sendSMS({ to, message }) {
    // TODO: Implement with Twilio, MSG91, etc.
    console.log(`[SMS] To: ${to}, Message: ${message}`);
}

async function sendPush({ userId, title, message }) {
    // TODO: Implement with Firebase FCM, OneSignal, etc.
    console.log(`[PUSH] To: ${userId}, Title: ${title}`);
}

// Get unread notifications for a user
export async function getUnreadNotifications(userId, limit = 10) {
    await connectDB();
    return Notification.find({ userId, isRead: false, isArchived: false })
        .sort({ createdAt: -1 })
        .limit(limit);
}

// Mark notification as read
export async function markAsRead(notificationId, userId) {
    await connectDB();
    return Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true }
    );
}

// Mark all as read
export async function markAllAsRead(userId) {
    await connectDB();
    return Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
    );
}
