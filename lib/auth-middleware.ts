/**
 * Enhanced Authentication Middleware
 * Provides authentication, authorization, and security checks
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "./auth";
import { rateLimiter, RATE_LIMITS } from "./rate-limiter";
import { prisma } from "./prisma";

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  groupId?: string;
}

/**
 * Verify authentication and return user context
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext | null> {
  const session = await verifyAuth(request);
  if (!session) {
    return null;
  }

  // Get user with company and group info
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      company: {
        include: { group: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId || undefined,
    groupId: user.company?.group?.id,
  };
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check rate limit for an endpoint
 */
export function checkRateLimit(
  key: string,
  limitConfig: { maxRequests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const allowed = rateLimiter.isAllowed(key, limitConfig.maxRequests, limitConfig.windowMs);
  const remaining = rateLimiter.getRemaining(key, limitConfig.maxRequests);
  const resetTime = rateLimiter.getResetTime(key);

  return { allowed, remaining, resetTime };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number,
  limit: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", Math.ceil(resetTime / 1000).toString());
  return response;
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.securityAuditLog.create({
      data: {
        userId,
        eventType,
        details: JSON.stringify(details),
        ipAddress: details.ipAddress as string || "unknown",
        userAgent: details.userAgent as string || "unknown",
      },
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

