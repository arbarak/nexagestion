/**
 * Rate Limiter Service
 * Provides rate limiting for API endpoints
 * In production, this should use Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly defaultWindowMs = 15 * 60 * 1000; // 15 minutes
  private readonly defaultMaxRequests = 5;

  /**
   * Check if a request should be allowed
   * @param key - Unique identifier (e.g., email, IP address)
   * @param maxRequests - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(
    key: string,
    maxRequests: number = this.defaultMaxRequests,
    windowMs: number = this.defaultWindowMs
  ): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number = this.defaultMaxRequests): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get reset time for a key
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    return entry?.resetTime || Date.now();
  }

  /**
   * Reset a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Preset configurations
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  API_READ: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  API_WRITE: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
  EXPORT: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
};

