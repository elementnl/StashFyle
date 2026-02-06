import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-keys";
import { getFile, deleteFile } from "@/lib/services/files";
import { logRequest } from "@/lib/services/request-logs";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit/client";
import { getUserPlan } from "@/lib/services/usage";
import { errorResponse, UnauthorizedError, AppError } from "@/lib/utils/errors";
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

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    const { id } = await params;
    const file = await getFile(id, apiKey.user_id);

    statusCode = 200;
    return NextResponse.json(file, { headers: getRateLimitHeaders(rateLimit) });
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
        method: "GET",
        endpoint: "/api/v1/files/:id",
        statusCode,
        responseTimeMs: Date.now() - startTime,
        errorCode,
        ipAddress: getIpAddress(req),
      });
    }
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    const { id } = await params;
    await deleteFile(id, apiKey.user_id);

    statusCode = 200;
    return NextResponse.json({ success: true }, { headers: getRateLimitHeaders(rateLimit) });
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
        method: "DELETE",
        endpoint: "/api/v1/files/:id",
        statusCode,
        responseTimeMs: Date.now() - startTime,
        errorCode,
        ipAddress: getIpAddress(req),
      });
    }
  }
}
