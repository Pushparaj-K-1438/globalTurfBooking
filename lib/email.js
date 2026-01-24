import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
    try {
        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
            return { success: false, error: 'Email credentials not configured' };
        }

        // Create transporter using Gmail SMTP (you can change this based on your email provider)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        console.log(`Attempting to send email to: ${to}`);
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

const sendBookingConfirmationEmail = async (userEmail, userName, bookingDetails) => {
    const { date, timeSlots, mobile, bookingId, totalAmount, discountAmount, finalAmount } = bookingDetails;

    const timeSlotsText = timeSlots.map(slot => {
        const [startTime, endTime] = slot.split(' - ');
        return `${startTime} - ${endTime}`;
    }).join(', ');

    const discountSection = discountAmount > 0 ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; font-size: 16px; margin: 0;"><strong>🎉 Discount Applied:</strong> ₹${discountAmount}</p>
            <p style="color: #856404; font-size: 14px; margin: 5px 0 0;">You saved ₹${discountAmount} on this booking!</p>
        </div>
    ` : '';

    const subject = 'Booking Confirmation';
    const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f7fa; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 30px;">
        <h2 style="color: #16a249; font-size: 24px; margin-bottom: 20px; text-align: center;">Booking Confirmed!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">Dear ${userName},</p>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">Your slot is confirmed for <strong>${date}</strong>.</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="color: #333; font-size: 16px; margin: 0;"><strong>Time Slots:</strong> ${timeSlotsText}</p>
          <p style="color: #333; font-size: 16px; margin: 10px 0 0;"><strong>Mobile:</strong> ${mobile}</p>
          <p style="color: #333; font-size: 16px; margin: 10px 0 0;"><strong>Booking ID:</strong> ${bookingId}</p>
        </div>

        ${discountSection}

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="color: #333; font-size: 18px; margin: 0; font-weight: bold;">${discountAmount > 0 ? `Amount After Discount: ₹${finalAmount}` : `Total Amount: ₹${finalAmount}`}</p>
            ${discountAmount > 0 ? `<p style="color: #6c757d; font-size: 14px; margin: 5px 0 0;">Original Total: ₹${totalAmount} | Discount: ₹${discountAmount}</p>` : ''}
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.5;">Thank you for choosing MRK Turf!</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
      <p style="color: #6c757d; font-size: 14px; text-align: center;">If you have any questions, contact us at <a href="mailto:mrkturfarena103@gmail.com" style="color: #16a249; text-decoration: none;">mrkturfarena103@gmail.com</a></p>
      <p style="color: #6c757d; font-size: 12px; text-align: center; margin-top: 10px;">&copy; ${new Date().getFullYear()} MRK Turf. All rights reserved.</p>
    </div>
    `;

    return await sendEmail(userEmail, subject, html);
};

const sendAdminNotificationEmail = async (adminEmail, userName, bookingDetails) => {
    const { date, timeSlots, mobile, bookingId, totalAmount, discountAmount, finalAmount } = bookingDetails;

    const timeSlotsText = timeSlots.map(slot => {
        const [startTime, endTime] = slot.split(' - ');
        return `${startTime} - ${endTime}`;
    }).join(', ');

    const discountSection = discountAmount > 0 ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; font-size: 16px; margin: 0;"><strong>🎉 Discount Applied:</strong> ₹${discountAmount}</p>
            <p style="color: #856404; font-size: 14px; margin: 5px 0 0;">Customer saved ₹${discountAmount} on this booking</p>
        </div>
    ` : '';

    const subject = 'New Booking Notification';
    const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f7fa; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 30px;">
        <h2 style="color: #16a249; font-size: 24px; margin-bottom: 20px; text-align: center;">New Booking Alert</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">A new booking has been confirmed for <strong>${userName}</strong> on <strong>${date}</strong>.</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="color: #333; font-size: 16px; margin: 0;"><strong>Customer:</strong> ${userName}</p>
          <p style="color: #333; font-size: 16px; margin: 10px 0 0;"><strong>Mobile:</strong> ${mobile}</p>
          <p style="color: #333; font-size: 16px; margin: 10px 0 0;"><strong>Time Slots:</strong> ${timeSlotsText}</p>
          <p style="color: #333; font-size: 16px; margin: 10px 0 0;"><strong>Booking ID:</strong> ${bookingId}</p>
        </div>

        ${discountSection}

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="color: #333; font-size: 18px; margin: 0; font-weight: bold;">${discountAmount > 0 ? `Amount After Discount: ₹${finalAmount}` : `Total Amount: ₹${finalAmount}`}</p>
            ${discountAmount > 0 ? `<p style="color: #6c757d; font-size: 14px; margin: 5px 0 0;">Original Total: ₹${totalAmount} | Discount: ₹${discountAmount}</p>` : ''}
        </div>
      </div>
      <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
      <p style="color: #6c757d; font-size: 14px; text-align: center;">This is an automated notification for admin purposes.</p>
      <p style="color: #6c757d; font-size: 12px; text-align: center; margin-top: 10px;">&copy; ${new Date().getFullYear()} MRK Turf. All rights reserved.</p>
    </div>
    `;

    return await sendEmail(adminEmail, subject, html);
};

export { sendEmail, sendBookingConfirmationEmail, sendAdminNotificationEmail };
