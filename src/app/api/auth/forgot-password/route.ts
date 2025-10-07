import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import crypto from "crypto";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  // Apply strict rate limiting (3 per hour)
  const identifier = getIdentifier(request);
  const rateLimitResult = await checkRateLimit(identifier, "strict");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many password reset attempts. Please try again later.",
        retryAfter: new Date(rateLimitResult.reset).toISOString(),
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
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // SECURITY: Always return success even if user not found
    // This prevents email enumeration attacks
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store token in database
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Get locale from request or default to 'en'
    const locale = request.headers.get("accept-language")?.includes("es")
      ? "es"
      : "en";

    // Send reset email
    await sendPasswordResetEmail(
      email,
      token,
      user.username,
      locale as "en" | "es",
    );

    logger.info(`Password reset token generated for user: ${user.username}`);

    return NextResponse.json({
      message:
        "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    logger.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}
