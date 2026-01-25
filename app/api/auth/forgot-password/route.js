import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongoose";
import User from "../../../../models/User";
import crypto from "crypto";

export async function POST(request) {
    try {
        await connectDB();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "If an account exists, a reset email will be sent"
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to user
        await User.findByIdAndUpdate(user._id, {
            passwordResetToken: resetTokenHash,
            passwordResetExpires: resetExpires
        });

        // In production, send email here
        // For now, just log it
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        console.log('Password reset URL:', resetUrl);

        // TODO: Send email using your email service
        // await sendEmail({
        //     to: user.email,
        //     subject: 'Password Reset Request',
        //     html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
        // });

        return NextResponse.json({
            success: true,
            message: "If an account exists, a reset email will be sent"
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
