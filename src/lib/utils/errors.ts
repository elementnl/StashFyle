import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("not_found", 404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Invalid or missing API key") {
    super("unauthorized", 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("forbidden", 403, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super("bad_request", 400, message);
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSize: number) {
    super("file_too_large", 413, `File exceeds maximum size of ${formatBytes(maxSize)}`);
  }
}

export class StorageLimitError extends AppError {
  constructor() {
    super("storage_limit_exceeded", 413, "Storage limit exceeded");
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("rate_limit_exceeded", 429, "Rate limit exceeded");
  }
}

export class ApiKeyLimitError extends AppError {
  constructor(limit: number) {
    super("api_key_limit_exceeded", 403, `API key limit reached (${limit} keys). Upgrade your plan for more.`);
  }
}

export class GracePeriodError extends AppError {
  constructor() {
    super("grace_period", 403, "Account is in grace period. Uploads are disabled. Please resubscribe to continue.");
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    { error: { code: "internal_error", message: "An unexpected error occurred" } },
    { status: 500 }
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}
