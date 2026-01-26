import Notification from '../models/Notification';
import NotificationTemplate from '../models/NotificationTemplate';
import User from '../models/User';
import connectDB from './mongoose';
import { getTenantById } from './tenant';
import nodemailer from 'nodemailer';

// Notification service for sending multi-channel notifications

export async function sendNotification({
    userId,
    userEmail, // Fallback if userId not provided
    userPhone, // Fallback
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

    // Resolve Contact Info
    let email = userEmail;
    let phone = userPhone;

    if (userId) {
        const user = await User.findById(userId);
        if (user) {
            email = user.email;
            phone = user.mobile;
        }
    }

    // Create Notification Record (In-App)
    let notification = null;
    if (userId) {
        notification = await Notification.create({
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
    }

    // Fetch Tenant Settings
    const tenant = await getTenantById(tenantId);
    const settings = tenant?.settings || {};

    // Send through each channel
    for (const channel of channels) {
        try {
            let status = 'sent';
            let errorMsg = null;

            switch (channel) {
                case 'email':
                    if (email && settings.email?.enabled) {
                        await sendEmail(settings.email, { to: email, title, message });
                    } else {
                        status = 'skipped';
                        errorMsg = !email ? 'No email' : 'Email disabled';
                    }
                    break;
                case 'sms':
                    if (phone && settings.sms?.enabled) {
                        await sendSMS(settings.sms, { to: phone, message });
                    } else {
                        status = 'skipped';
                        errorMsg = !phone ? 'No phone' : 'SMS disabled';
                    }
                    break;
                case 'whatsapp':
                    if (phone && settings.whatsapp?.enabled) {
                        await sendWhatsApp(settings.whatsapp, { to: phone, message });
                    } else {
                        status = 'skipped';
                        errorMsg = !phone ? 'No phone' : 'WhatsApp disabled';
                    }
                    break;
                case 'push':
                    if (userId && settings.push?.enabled) {
                        await sendPush(settings.push, { userId, title, message });
                    } else {
                        status = 'skipped';
                        errorMsg = !userId ? 'No userId' : 'Push disabled';
                    }
                    break;
                case 'in_app':
                    // Already stored in DB
                    break;
            }

            // Update channel status if record exists
            if (notification) {
                await Notification.updateOne(
                    { _id: notification._id, 'channels.channel': channel },
                    { $set: { 'channels.$.status': status, 'channels.$.errorMessage': errorMsg, 'channels.$.sentAt': new Date() } }
                );
            }
        } catch (error) {
            console.error(`Failed to send ${channel} notification:`, error);
            if (notification) {
                await Notification.updateOne(
                    { _id: notification._id, 'channels.channel': channel },
                    { $set: { 'channels.$.status': 'failed', 'channels.$.errorMessage': error.message } }
                );
            }
        }
    }

    return notification;
}

// Send notification using a template
export async function sendTemplatedNotification({
    event,
    userId,
    userEmail,
    userPhone,
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
    }).sort({ tenantId: -1, isGlobal: 1 }); // Prefer tenant-specific (sort descending by tenantId existence effectively? no, need explicit logic)
    // Actually findOne sorting by tenantId: -1 will put the one WITH tenantId before null/undefined if structure matches.
    // Better to query explicitly.

    if (!template) {
        // Fallback or log
        console.log(`No template found for ${event}, using default message.`);
        // potentially return or send generic
    }

    // Replace variables in template
    const replaceVariables = (text) => {
        if (!text) return '';
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
    };

    const title = template ? replaceVariables(template.inApp?.title || template.email?.subject || event) : event;
    const message = template ? replaceVariables(template.inApp?.body || template.email?.htmlBody || '') : 'Notification';

    return sendNotification({
        userId,
        userEmail,
        userPhone,
        tenantId,
        type: getTypeFromEvent(event),
        title,
        message,
        channels: channels || template?.channels || ['in_app'],
        metadata: data,
    });
}

function getTypeFromEvent(event) {
    if (event.includes('booking')) return 'booking';
    if (event.includes('payment')) return 'payment';
    if (event.includes('review')) return 'review';
    return 'info';
}

// --- Channel Implementations ---

async function sendEmail(config, { to, title, message }) {
    if (!config.smtpHost || !config.smtpUser) {
        console.log(`[EMAIL MOCK] To: ${to}, Config missing`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort) || 587,
        secure: Number(config.smtpPort) === 465,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass, // stored roughly in Settings
        },
    });

    await transporter.sendMail({
        from: config.smtpUser, // or configurable sender
        to,
        subject: title,
        html: message, // Assuming message is HTML
    });
    console.log(`[EMAIL SENT] To: ${to}`);
}

async function sendSMS(config, { to, message }) {
    console.log(`[SMS MOCK] To: ${to}, Provider: ${config.provider}, Msg: ${message}`);
    // Implement Twilio/MSG91 fetch here
}

async function sendWhatsApp(config, { to, message }) {
    console.log(`[WHATSAPP MOCK] To: ${to}, Msg: ${message}`);

    if (config.provider === 'meta' && config.accessToken && config.phoneNumberId) {
        // Basic Text Message
        const url = `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`;
        const body = {
            messaging_product: "whatsapp",
            to: to, // Ensure format is correct (e.g. 919876543210)
            type: "text",
            text: { body: message }
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            console.error('WhatsApp Error:', data);
            throw new Error(data.error?.message || 'WhatsApp failed');
        }
    }
}

async function sendPush(config, { userId, title, message }) {
    console.log(`[PUSH MOCK] User: ${userId}, Title: ${title}`);
    // Needs FCM Token resolution from userId (User model should store fcmToken)
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
