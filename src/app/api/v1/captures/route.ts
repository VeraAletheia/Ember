import { NextRequest } from "next/server";
import { validateBearerToken, requireScope } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { db } from "@/lib/db";
import { captures, profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";
import { checkCaptureLimit } from "@/lib/rate-limit";
import { apiCreateCaptureSchema } from "@/lib/validators/schemas";

export async function POST(request: NextRequest) {
  // Auth
  const authResult = await validateBearerToken(request);
  if (authResult instanceof Response) return authResult;

  const scopeError = requireScope(authResult, "write");
  if (scopeError) return scopeError;

  // Rate limit (capture-specific, per day)
  const rateLimit = await checkCaptureLimit(authResult.userId, authResult.tier);
  if (!rateLimit.success) {
    return apiError("RATE_LIMIT_EXCEEDED", "Daily capture limit exceeded", 429, {
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

  const validated = apiCreateCaptureSchema.safeParse(body);
  if (!validated.success) {
    return apiError(
      "VALIDATION_ERROR",
      validated.error.issues[0]?.message ?? "Invalid input",
      422
    );
  }

  const { profileId, text, platform } = validated.data;

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

  // Create capture
  const [capture] = await db
    .insert(captures)
    .values({
      profileId,
      method: "api",
      status: "queued",
      rawText: text,
      platform: platform ?? null,
    })
    .returning();

  // Fire Inngest event
  await inngest.send({
    name: "capture/created",
    data: { captureId: capture.id },
  });

  return apiSuccess(
    { captureId: capture.id, status: "queued" },
    { status: 201, rateLimit }
  );
}
