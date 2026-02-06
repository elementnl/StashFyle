import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-keys";
import { createSignedUrl } from "@/lib/services/files";
import { logRequest } from "@/lib/services/request-logs";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit/client";
import { getUserPlan } from "@/lib/services/usage";
import { errorResponse, UnauthorizedError, BadRequestError, ForbiddenError, AppError } from "@/lib/utils/errors";
import type { ApiKey } from "@/lib/db/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getIpAddress(req: NextRequest): string | undefined {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined
  );
}

export async function POST(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const startTime = Date.now();
  let apiKey: ApiKey | null = null;
  let statusCode = 500;
  let errorCode: string | undefined;

  try {
    apiKey = await validateApiKey(req.headers.get("authorization"));
    if (!apiKey) throw new UnauthorizedError();

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
      throw new ForbiddenError("Signed URLs require a secret key");
    }

    const body = await req.json();
    const expiresIn = body.expires_in;

    if (!expiresIn || typeof expiresIn !== "number") {
      throw new BadRequestError("expires_in is required and must be a number (seconds)");
    }

    if (expiresIn < 60 || expiresIn > 604800) {
      throw new BadRequestError("expires_in must be between 60 and 604800 seconds (1 minute to 7 days)");
    }

    const { id } = await params;
    const result = await createSignedUrl(id, apiKey.user_id, expiresIn);

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
        endpoint: "/api/v1/files/:id/signed-url",
        statusCode,
        responseTimeMs: Date.now() - startTime,
        errorCode,
        ipAddress: getIpAddress(req),
      });
    }
  }
}
