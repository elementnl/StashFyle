import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("Upstash Redis not configured - rate limiting disabled");
}

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

type PlanType = "free" | "hobby" | "pro";

const planRequestLimits: Record<PlanType, number> = {
  free: 100,
  hobby: 300,
  pro: 1000,
};

function createRateLimiter(plan: PlanType): Ratelimit | null {
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(planRequestLimits[plan], "1 m"),
    analytics: true,
    prefix: `stashfyle:ratelimit:${plan}`,
  });
}

const rateLimiters: Record<PlanType, Ratelimit | null> = {
  free: createRateLimiter("free"),
  hobby: createRateLimiter("hobby"),
  pro: createRateLimiter("pro"),
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  plan: PlanType = "free"
): Promise<RateLimitResult> {
  const limiter = rateLimiters[plan];

  if (!limiter) {
    return {
      success: true,
      limit: planRequestLimits[plan],
      remaining: planRequestLimits[plan],
      reset: Date.now() + 60000,
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
