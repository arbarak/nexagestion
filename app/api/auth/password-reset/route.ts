import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { generateOTP } from "@/lib/encryption";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import { logSecurityEvent, addRateLimitHeaders } from "@/lib/auth-middleware";
import { z } from "zod";

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
});

/**
 * POST /api/auth/password-reset
 * Request password reset token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestResetSchema.parse(body);

    // Check rate limiting
    const rateLimit = rateLimiter.isAllowed(
      `password-reset:${email}`,
      RATE_LIMITS.PASSWORD_RESET.maxRequests,
      RATE_LIMITS.PASSWORD_RESET.windowMs
    );

    if (!rateLimit) {
      const response = NextResponse.json(
        { message: "Too many password reset requests. Please try again later." },
        { status: 429 }
      );
      const remaining = rateLimiter.getRemaining(
        `password-reset:${email}`,
        RATE_LIMITS.PASSWORD_RESET.maxRequests
      );
      const resetTime = rateLimiter.getResetTime(`password-reset:${email}`);
      return addRateLimitHeaders(response, remaining, resetTime, RATE_LIMITS.PASSWORD_RESET.maxRequests);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json(
        { message: "If email exists, password reset link will be sent" },
        { status: 200 }
      );
    }

    // Generate reset code
    const resetCode = generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        code: resetCode,
        expiresAt,
        used: false,
      },
    });

    // Log password reset request
    await logSecurityEvent(user.id, "PASSWORD_RESET_REQUESTED", {
      email,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    // In production, send reset code via email
    console.log(`Password reset code for ${email}: ${resetCode}`);

    return NextResponse.json(
      { message: "If email exists, password reset link will be sent" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/password-reset
 * Verify reset code and update password
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = resetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid reset request" },
        { status: 400 }
      );
    }

    // Find and verify reset code
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      await logSecurityEvent(user.id, "PASSWORD_RESET_FAILED", {
        reason: "Invalid or expired code",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { message: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and mark reset as used
    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    // Log successful password reset
    await logSecurityEvent(user.id, "PASSWORD_RESET_SUCCESS", {
      email,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

