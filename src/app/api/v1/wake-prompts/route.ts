import { NextRequest } from "next/server";
import { validateBearerToken, requireScope } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { checkWakeLimit } from "@/lib/rate-limit";
import { generateWakePromptSchema } from "@/lib/validators/schemas";
import { generateWakePrompt } from "@/lib/ai/wake-prompt";
import type { MemoryCategory } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  // Auth
  const authResult = await validateBearerToken(request);
  if (authResult instanceof Response) return authResult;

  const scopeError = requireScope(authResult, "wake");
  if (scopeError) return scopeError;

  // Wake prompt rate limit (per hour)
  const rateLimit = await checkWakeLimit(authResult.userId, authResult.tier);
  if (!rateLimit.success) {
    return apiError("RATE_LIMIT_EXCEEDED", "Hourly wake prompt limit exceeded", 429, {
      limit: rateLimit.limit,
      reset: rateLimit.reset,
    });
  }

  // Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON body", 422);
  }

  const validated = generateWakePromptSchema.safeParse(body);
  if (!validated.success) {
    return apiError(
      "VALIDATION_ERROR",
      validated.error.issues[0]?.message ?? "Invalid input",
      422
    );
  }

  const { profileId, categories, budget } = validated.data;

  // Verify profile belongs to user
  const profile = await db.query.profiles.findFirst({
    where: and(
      eq(profiles.id, profileId),
      eq(profiles.userId, authResult.userId)
    ),
  });

  if (!profile) {
    return apiError("NOT_FOUND", "Profile not found", 404);
  }

  // Get user's token budget
  const user = await db.query.users.findFirst({
    where: eq(users.id, authResult.userId),
  });

  const tokenBudget = budget ?? user?.tokenBudget ?? 8000;

  const result = await generateWakePrompt(
    profileId,
    categories as MemoryCategory[],
    tokenBudget
  );

  return apiSuccess(result, { rateLimit });
}
