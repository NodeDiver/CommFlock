import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Apply auth rate limiting (5 per 10 minutes)
  const identifier = getIdentifier(request);
  const rateLimitResult = await checkRateLimit(identifier, "auth");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many attempts. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      },
    );
  }

  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Find valid token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Check if token was already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: "This reset link has already been used" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and mark token as used
    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { hashedPassword },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    logger.info(
      `Password reset successful for user: ${resetToken.user.username}`,
    );

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    logger.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}
