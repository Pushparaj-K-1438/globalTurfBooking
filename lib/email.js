import nodemailer from 'nodemailer';

/**
 * Generic email sender
 */
const sendEmail = async (to, subject, html, tenantSettings = null) => {
    try {
        const smtpHost = tenantSettings?.email?.smtpHost || process.env.SMTP_HOST;
        const smtpPort = tenantSettings?.email?.smtpPort || process.env.SMTP_PORT || 587;
        const smtpUser = tenantSettings?.email?.smtpUser || process.env.SMTP_USER;
        const smtpPass = tenantSettings?.email?.smtpPass || process.env.SMTP_PASS;

        if (!smtpUser || !smtpPass) {
            console.error('Email credentials not configured');
            return { success: false, error: 'Email credentials not configured' };
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort == 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: `"${tenantSettings?.businessName || 'BookIt'}" <${smtpUser}>`,
            to,
            subject,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

/**
 * Send automated booking confirmation to customer
 */
const sendBookingConfirmation = async (booking, tenant) => {
    const { name, email, bookingId, date, timeSlots, finalAmount } = booking;
    const businessName = tenant?.name || "BookIt";

    const subject = `Booking Confirmed - ${bookingId}`;
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <div style="background: linear-gradient(to right, #10b981, #059669); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Order ID: ${bookingId}</p>
        </div>
        <div style="background: white; border: 1px solid #e2e8f0; padding: 30px; border-radius: 0 0 16px 16px;">
            <p>Hi ${name},</p>
            <p>Your booking at <strong>${businessName}</strong> has been successfully confirmed. We look forward to seeing you!</p>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #64748b;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Date</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${new Date(date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Time Slots</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${timeSlots.join(', ')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Amount Paid</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">₹${finalAmount}</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 30px;">
                Thank you for choosing ${businessName}. If you have any questions, please contact us.
            </p>
        </div>
    </div>
    `;

    return await sendEmail(email, subject, html, tenant?.settings);
};

/**
 * Send booking confirmation to user (legacy/specific signature)
 */
const sendBookingConfirmationEmail = async (email, name, bookingDetails) => {
    const subject = `Booking Confirmation - ${bookingDetails.bookingId}`;
    const html = `
    <div style="font-family: sans-serif; color: #334155;">
        <h2>Booking Confirmed!</h2>
        <p>Hi ${name}, your booking is confirmed.</p>
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
        <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>Slots:</strong> ${bookingDetails.timeSlots.join(', ')}</p>
        <p><strong>Amount:</strong> ₹${bookingDetails.finalAmount}</p>
    </div>
    `;
    return await sendEmail(email, subject, html);
};

/**
 * Send notification to admin
 */
const sendAdminNotificationEmail = async (adminEmail, userName, bookingDetails) => {
    const subject = `New Booking Received - ${bookingDetails.bookingId}`;
    const html = `
    <div style="font-family: sans-serif; color: #334155;">
        <h2>New Booking Notification</h2>
        <p>User: ${userName} (${bookingDetails.mobile})</p>
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
        <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>Slots:</strong> ${bookingDetails.timeSlots.join(', ')}</p>
    </div>
    `;
    return await sendEmail(adminEmail, subject, html);
};

export { sendEmail, sendBookingConfirmation, sendBookingConfirmationEmail, sendAdminNotificationEmail };
