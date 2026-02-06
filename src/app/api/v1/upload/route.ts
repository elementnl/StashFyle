import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-keys";
import { uploadFile } from "@/lib/services/files";
import { logRequest } from "@/lib/services/request-logs";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit/client";
import { getPlanLimits, getCurrentUsage, getUserPlan } from "@/lib/services/usage";
import { isInGracePeriod } from "@/lib/services/subscriptions";
import { errorResponse, UnauthorizedError, ForbiddenError, BadRequestError, GracePeriodError, AppError } from "@/lib/utils/errors";
import type { ApiKey } from "@/lib/db/types";

function parseExpiry(expires: string): Date | null {
  const match = expires.match(/^(\d+)(h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const now = new Date();
  if (unit === "h") {
    return new Date(now.getTime() + value * 60 * 60 * 1000);
  }
  if (unit === "d") {
    return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
  }
  return null;
}

function getIpAddress(req: NextRequest): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  let apiKey: ApiKey | null = null;
  let statusCode = 500;
  let errorCode: string | undefined;
  let fileSize: number | undefined;

  try {
    apiKey = await validateApiKey(req.headers.get("authorization"));
    if (!apiKey) throw new UnauthorizedError();

    // Block uploads during grace period
    const inGracePeriod = await isInGracePeriod(apiKey.user_id);
    if (inGracePeriod) {
      throw new GracePeriodError();
    }

    const userPlan = await getUserPlan(apiKey.user_id);
    const rateLimit = await checkRateLimit(apiKey.id, userPlan);
    if (!rateLimit.success) {
      statusCode = 429;
      errorCode = "rate_limit_exceeded";
      return NextResponse.json(
        { error: { code: "rate_limit_exceeded", message: "Rate limit exceeded" } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    if (apiKey.type === "public") {
      const origin = req.headers.get("origin");
      if (!apiKey.allowed_origins?.includes(origin ?? "")) {
        throw new ForbiddenError("Origin not allowed");
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new BadRequestError("file is required");
    }

    fileSize = file.size;

    const folder = formData.get("folder") as string | null;
    const isPrivate = formData.get("private") === "true" && apiKey.type === "secret";
    const expiresIn = formData.get("expires") as string | null;

    const expiresAt = expiresIn ? parseExpiry(expiresIn) : null;
    if (expiresIn && !expiresAt) {
      throw new BadRequestError("Invalid expires format. Use format like '1h', '7d', '30d'");
    }

    const planLimits = getPlanLimits(userPlan);
    const currentUsage = await getCurrentUsage(apiKey.user_id);

    const result = await uploadFile({
      userId: apiKey.user_id,
      file: Buffer.from(await file.arrayBuffer()),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      folder: folder ?? undefined,
      isPrivate,
      expiresAt: expiresAt ?? undefined,
      limits: {
        maxFileSize: planLimits.maxFileSize,
        maxStorage: planLimits.maxStorage,
        currentStorage: currentUsage.storage_bytes,
      },
    });

    statusCode = 200;
    return NextResponse.json(result, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error) {
    const response = errorResponse(error);
    statusCode = response.status;
    if (error instanceof AppError) {
      errorCode = error.code;
    }
    return response;
  } finally {
    if (apiKey) {
      logRequest({
        apiKey,
        method: "POST",
        endpoint: "/api/v1/upload",
        statusCode,
        responseTimeMs: Date.now() - startTime,
        fileSize,
        errorCode,
        ipAddress: getIpAddress(req),
      });
    }
  }
}
