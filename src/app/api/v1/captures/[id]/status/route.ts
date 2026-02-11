import { NextRequest } from "next/server";
import { validateBearerToken, requireScope } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { db } from "@/lib/db";
import { captures, memories, profiles } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { checkApiLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await validateBearerToken(request);
  if (authResult instanceof Response) return authResult;

  const scopeError = requireScope(authResult, "read");
  if (scopeError) return scopeError;

  // API rate limit
  const rateLimit = await checkApiLimit(authResult.userId, authResult.tier);
  if (!rateLimit.success) {
    return apiError("RATE_LIMIT_EXCEEDED", "API rate limit exceeded", 429, {
      limit: rateLimit.limit,
      reset: rateLimit.reset,
    });
  }

  const { id } = await params;

  const capture = await db.query.captures.findFirst({
    where: eq(captures.id, id),
    with: { profile: true },
  });

  if (!capture || capture.profile.userId !== authResult.userId) {
    return apiError("NOT_FOUND", "Capture not found", 404);
  }

  let memoryCount = 0;
  if (capture.status === "completed") {
    const [result] = await db
      .select({ count: count() })
      .from(memories)
      .where(eq(memories.captureId, id));
    memoryCount = result?.count ?? 0;
  }

  return apiSuccess({
    id: capture.id,
    status: capture.status,
    memoryCount,
    errorMessage: capture.errorMessage,
    createdAt: capture.createdAt,
  }, { rateLimit });
}
