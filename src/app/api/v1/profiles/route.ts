import { NextRequest } from "next/server";
import { validateBearerToken, requireScope } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Auth
  const authResult = await validateBearerToken(request);
  if (authResult instanceof Response) return authResult;

  const scopeError = requireScope(authResult, "read");
  if (scopeError) return scopeError;

  const userProfiles = await db.query.profiles.findMany({
    where: eq(profiles.userId, authResult.userId),
    orderBy: (profiles, { desc }) => [desc(profiles.isDefault)],
  });

  return apiSuccess(userProfiles);
}
