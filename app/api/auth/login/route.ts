import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";
import { generateOTP } from "@/lib/encryption";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import { logSecurityEvent, addRateLimitHeaders } from "@/lib/auth-middleware";
import { z } from "zod";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verify2FASchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, code } = body;

    // If code is provided, verify 2FA
    if (code) {
      const verifyBody = verify2FASchema.parse({ email, code });

      const twoFA = await prisma.twoFactorAuth.findFirst({
        where: {
          user: { email: verifyBody.email },
          code: verifyBody.code,
          verified: false,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!twoFA) {
        return NextResponse.json(
          { message: "Invalid or expired 2FA code" },
          { status: 400 }
        );
      }

      // Mark 2FA as verified
      await prisma.twoFactorAuth.update({
        where: { id: twoFA.id },
        data: { verified: true },
      });

      // Create session token
      const token = createToken({
        userId: twoFA.user.id,
        email: twoFA.user.email,
        role: twoFA.user.role,
        companyId: twoFA.user.companyId || undefined,
      });

      await setSessionCookie(token);

      return NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: twoFA.user.id,
            email: twoFA.user.email,
            firstName: twoFA.user.firstName,
            lastName: twoFA.user.lastName,
            role: twoFA.user.role,
            companyId: twoFA.user.companyId,
          },
        },
        { status: 200 }
      );
    }

    // Regular login flow
    const loginBody = loginSchema.parse({ email, password });

    // Check rate limiting
    const rateLimit = rateLimiter.isAllowed(
      loginBody.email,
      RATE_LIMITS.LOGIN.maxRequests,
      RATE_LIMITS.LOGIN.windowMs
    );

    if (!rateLimit) {
      const response = NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
      const remaining = rateLimiter.getRemaining(loginBody.email, RATE_LIMITS.LOGIN.maxRequests);
      const resetTime = rateLimiter.getResetTime(loginBody.email);
      return addRateLimitHeaders(response, remaining, resetTime, RATE_LIMITS.LOGIN.maxRequests);
    }

    const user = await prisma.user.findUnique({
      where: { email: loginBody.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(loginBody.password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await logSecurityEvent(user.id, "LOGIN_FAILED", {
        email: loginBody.email,
        reason: "Invalid password",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If 2FA is enabled, send OTP
    if (user.twoFactorEnabled) {
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.twoFactorAuth.create({
        data: {
          userId: user.id,
          method: "email",
          code: otp,
          expiresAt,
          verified: false,
        },
      });

      // In production, send OTP via email
      console.log(`2FA OTP for ${user.email}: ${otp}`);

      return NextResponse.json(
        {
          message: "2FA code sent to your email",
          requiresVerification: true,
          expiresIn: 600, // 10 minutes in seconds
        },
        { status: 200 }
      );
    }

    // No 2FA, create session directly
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    });

    await setSessionCookie(token);

    // Log successful login
    await logSecurityEvent(user.id, "LOGIN_SUCCESS", {
      email: user.email,
      role: user.role,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

