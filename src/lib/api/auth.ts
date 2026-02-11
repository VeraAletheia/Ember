import { db } from "@/lib/db";
import { apiTokens, users } from "@/lib/db/schema";
import type { UserTier } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
import { apiError } from "./response";
import crypto from "crypto";

export interface AuthResult {
  userId: string;
  tokenId: string;
  scopes: string[];
  tier: UserTier;
}

/**
 * Validate Bearer token from Authorization header.
 * Returns user info or an error response.
 */
export async function validateBearerToken(
  request: Request
): Promise<AuthResult | Response> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiError("UNAUTHORIZED", "Missing or invalid Bearer token", 401);
  }

  const token = authHeader.slice(7);

  if (!token.startsWith("emb_live_")) {
    return apiError("UNAUTHORIZED", "Invalid token format", 401);
  }

  // Hash the token to look up in DB
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Find the token
  const record = await db.query.apiTokens.findFirst({
    where: and(
      eq(apiTokens.tokenHash, tokenHash),
    ),
    with: { user: true },
  });

  if (!record) {
    return apiError("UNAUTHORIZED", "Invalid Bearer token", 401);
  }

  // Check expiration
  if (record.expiresAt && record.expiresAt < new Date()) {
    return apiError("UNAUTHORIZED", "Token has expired", 401);
  }

  // Update lastUsedAt
  await db
    .update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, record.id));

  return {
    userId: record.userId,
    tokenId: record.id,
    scopes: record.scopes,
    tier: record.user.tier,
  };
}

/**
 * Check if the authenticated token has the required scope.
 */
export function requireScope(auth: AuthResult, scope: string): Response | null {
  if (!auth.scopes.includes(scope)) {
    return apiError(
      "FORBIDDEN",
      `Token lacks required scope: ${scope}`,
      403
    ) as unknown as Response;
  }
  return null;
}

/**
 * Generate a new API token. Returns the raw token (show once) and its hash.
 */
export function generateApiToken(): { raw: string; hash: string } {
  const bytes = crypto.randomBytes(32);
  const raw = `emb_live_${bytes.toString("base64url")}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}
