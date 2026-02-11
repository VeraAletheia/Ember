import { NextResponse } from "next/server";

interface SuccessOptions {
  status?: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

interface PaginatedOptions extends SuccessOptions {
  cursor: string | null;
  hasMore: boolean;
}

export function apiSuccess<T>(data: T, options: SuccessOptions = {}) {
  const headers: Record<string, string> = {};

  if (options.rateLimit) {
    headers["X-RateLimit-Limit"] = String(options.rateLimit.limit);
    headers["X-RateLimit-Remaining"] = String(options.rateLimit.remaining);
    headers["X-RateLimit-Reset"] = String(options.rateLimit.reset);
  }

  return NextResponse.json(
    {
      data,
      meta: { timestamp: new Date().toISOString() },
    },
    { status: options.status ?? 200, headers }
  );
}

export function apiPaginated<T>(
  data: T[],
  options: PaginatedOptions
) {
  const headers: Record<string, string> = {};

  if (options.rateLimit) {
    headers["X-RateLimit-Limit"] = String(options.rateLimit.limit);
    headers["X-RateLimit-Remaining"] = String(options.rateLimit.remaining);
    headers["X-RateLimit-Reset"] = String(options.rateLimit.reset);
  }

  return NextResponse.json(
    {
      data,
      meta: {
        cursor: options.cursor,
        hasMore: options.hasMore,
        timestamp: new Date().toISOString(),
      },
    },
    { status: options.status ?? 200, headers }
  );
}

type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "CAPTURE_FAILED"
  | "INTERNAL_ERROR";

export function apiError(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  const headers: Record<string, string> = {};

  if (code === "RATE_LIMIT_EXCEEDED" && details?.reset) {
    headers["Retry-After"] = String(
      Math.ceil((Number(details.reset) - Date.now()) / 1000)
    );
  }

  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status, headers }
  );
}
