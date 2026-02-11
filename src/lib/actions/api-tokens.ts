"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { apiTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureUser } from "./profiles";
import { generateApiToken } from "@/lib/api/auth";
import { createApiTokenSchema, type ActionState } from "@/lib/validators/schemas";

export async function createApiTokenAction(
  input: unknown
): Promise<ActionState<{ token: string; id: string; name: string }>> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: "error", error: "Not authenticated" };
    }

    const validated = createApiTokenSchema.safeParse(input);
    if (!validated.success) {
      return {
        status: "error",
        error: validated.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const user = await ensureUser(clerkId);
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

    // Return the raw token — shown ONCE, never stored
    return {
      status: "success",
      data: { token: raw, id: record.id, name: record.name },
    };
  } catch (error) {
    console.error("createApiTokenAction error:", error);
    return { status: "error", error: "Failed to create API token" };
  }
}

export async function listApiTokensAction(): Promise<
  ActionState<
    Array<{
      id: string;
      name: string;
      scopes: string[];
      lastUsedAt: Date | null;
      createdAt: Date;
    }>
  >
> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: "error", error: "Not authenticated" };
    }

    const user = await ensureUser(clerkId);

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

    return { status: "success", data: tokens };
  } catch (error) {
    console.error("listApiTokensAction error:", error);
    return { status: "error", error: "Failed to list API tokens" };
  }
}

export async function revokeApiTokenAction(
  tokenId: string
): Promise<ActionState<{ id: string }>> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { status: "error", error: "Not authenticated" };
    }

    const user = await ensureUser(clerkId);

    const token = await db.query.apiTokens.findFirst({
      where: and(
        eq(apiTokens.id, tokenId),
        eq(apiTokens.userId, user.id)
      ),
    });

    if (!token) {
      return { status: "error", error: "Token not found" };
    }

    await db.delete(apiTokens).where(eq(apiTokens.id, tokenId));

    return { status: "success", data: { id: tokenId } };
  } catch (error) {
    console.error("revokeApiTokenAction error:", error);
    return { status: "error", error: "Failed to revoke token" };
  }
}
