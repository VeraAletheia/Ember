import { NextRequest } from "next/server";
import { validateBearerToken, requireScope } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkApiLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Auth
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

  const userProfiles = await db.query.profiles.findMany({
    where: eq(profiles.userId, authResult.userId),
    orderBy: (profiles, { desc }) => [desc(profiles.isDefault)],
  });

  return apiSuccess(userProfiles, { rateLimit });
}
