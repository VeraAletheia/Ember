"use server";

import { getAuthUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, profiles, captures, memories } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { ensureUser } from "./profiles";
import type { ActionState } from "@/lib/validators/schemas";

interface ExportData {
  exportedAt: string;
  user: {
    email: string;
    tier: string;
    tokenBudget: number;
    createdAt: string;
  };
  profiles: Array<{
    name: string;
    platform: string | null;
    isDefault: boolean;
  }>;
  memories: Array<{
    category: string;
    factualContent: string;
    emotionalSignificance: string | null;
    verbatimText: string;
    importance: number;
    createdAt: string;
  }>;
  captures: Array<{
    method: string;
    status: string;
    platform: string | null;
    createdAt: string;
    memoryCount: number;
  }>;
  stats: {
    totalMemories: number;
    totalCaptures: number;
    byCategory: Record<string, number>;
  };
}

/**
 * Export all user data as a JSON object.
 * Excludes soft-deleted records.
 */
export async function exportDataAction(): Promise<
  ActionState<ExportData>
> {
  try {
    const clerkId = await getAuthUserId();
    if (!clerkId) {
      return { status: "error", error: "Not authenticated" };
    }

    const user = await ensureUser(clerkId);

    // Get all profiles
    const userProfiles = await db.query.profiles.findMany({
      where: and(eq(profiles.userId, user.id), isNull(profiles.deletedAt)),
    });

    // Get all memories across all profiles
    const allMemories = [];
    const byCategory: Record<string, number> = {};

    for (const profile of userProfiles) {
      const profileMemories = await db.query.memories.findMany({
        where: and(
          eq(memories.profileId, profile.id),
          isNull(memories.deletedAt)
        ),
        orderBy: (m, { desc }) => [desc(m.createdAt)],
      });

      for (const m of profileMemories) {
        allMemories.push({
          category: m.category,
          factualContent: m.factualContent,
          emotionalSignificance: m.emotionalSignificance,
          verbatimText: m.verbatimText,
          importance: m.importance,
          createdAt: m.createdAt.toISOString(),
        });
        byCategory[m.category] = (byCategory[m.category] || 0) + 1;
      }
    }

    // Get all captures
    const allCaptures = [];

    for (const profile of userProfiles) {
      const profileCaptures = await db.query.captures.findMany({
        where: and(
          eq(captures.profileId, profile.id),
          isNull(captures.deletedAt)
        ),
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      });

      for (const c of profileCaptures) {
        const memCount = allMemories.filter(
          (m) => m.createdAt >= c.createdAt.toISOString()
        ).length;
        allCaptures.push({
          method: c.method,
          status: c.status,
          platform: c.platform,
          createdAt: c.createdAt.toISOString(),
          memoryCount: memCount,
        });
      }
    }

    const exportData: ExportData = {
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        tier: user.tier,
        tokenBudget: user.tokenBudget,
        createdAt: user.createdAt.toISOString(),
      },
      profiles: userProfiles.map((p) => ({
        name: p.name,
        platform: p.platform,
        isDefault: p.isDefault,
      })),
      memories: allMemories,
      captures: allCaptures,
      stats: {
        totalMemories: allMemories.length,
        totalCaptures: allCaptures.length,
        byCategory,
      },
    };

    return { status: "success", data: exportData };
  } catch (error) {
    console.error("exportDataAction error:", error);
    return { status: "error", error: "Failed to export data" };
  }
}
