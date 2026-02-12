import { NextRequest } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { db } from "@/lib/db";
import { apiTokens, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateApiToken } from "@/lib/api/auth";
import { createApiTokenSchema } from "@/lib/validators/schemas";

export async function GET(request: NextRequest) {
  const clerkId = await getAuthUserId();
  if (!clerkId) {
    return apiError("UNAUTHORIZED", "Not authenticated", 401);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    return apiError("NOT_FOUND", "User not found", 404);
  }

  const tokens = await db.query.apiTokens.findMany({
    where: eq(apiTokens.userId, user.id),
    columns: {
      id: true,
      name: true,
      scopes: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: (apiTokens, { desc }) => [desc(apiTokens.createdAt)],
  });

  return apiSuccess(tokens);
}

export async function POST(request: NextRequest) {
  const clerkId = await getAuthUserId();
  if (!clerkId) {
    return apiError("UNAUTHORIZED", "Not authenticated", 401);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    return apiError("NOT_FOUND", "User not found", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON body", 422);
  }

  const validated = createApiTokenSchema.safeParse(body);
  if (!validated.success) {
    return apiError(
      "VALIDATION_ERROR",
      validated.error.issues[0]?.message ?? "Invalid input",
      422
    );
  }

  const { raw, hash } = generateApiToken();

  const [record] = await db
    .insert(apiTokens)
    .values({
      userId: user.id,
      name: validated.data.name,
      tokenHash: hash,
      scopes: validated.data.scopes,
    })
    .returning();

  return apiSuccess(
    {
      id: record.id,
      name: record.name,
      token: raw,
      scopes: record.scopes,
      createdAt: record.createdAt,
    },
    { status: 201 }
  );
}
