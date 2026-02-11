import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  message?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    claude: HealthCheck;
  };
}

const startTime = Date.now();

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const checks = await Promise.allSettled([checkDatabase(), checkClaudeAPI()]);

  const [dbCheck, claudeCheck] = checks;

  const database =
    dbCheck.status === "fulfilled"
      ? dbCheck.value
      : {
          status: "unhealthy" as const,
          latencyMs: 0,
          message: String(dbCheck.reason),
        };

  const claude =
    claudeCheck.status === "fulfilled"
      ? claudeCheck.value
      : {
          status: "unhealthy" as const,
          latencyMs: 0,
          message: String(claudeCheck.reason),
        };

  // Overall status: unhealthy if any critical check fails
  const criticalChecks = [database, claude];
  const overallStatus = criticalChecks.some((c) => c.status === "unhealthy")
    ? "unhealthy"
    : criticalChecks.some((c) => c.status === "degraded")
      ? "degraded"
      : "healthy";

  const response: HealthResponse = {
    status: overallStatus,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database,
      claude,
    },
  };

  const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1 as ok`);
    const latencyMs = Date.now() - start;

    if (latencyMs > 2000) {
      return {
        status: "degraded",
        latencyMs,
        message: `Database responding but slow (${latencyMs}ms)`,
      };
    }

    return { status: "healthy", latencyMs };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message:
        error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

async function checkClaudeAPI(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        status: "unhealthy",
        latencyMs: 0,
        message: "ANTHROPIC_API_KEY not configured",
      };
    }

    // Minimal API call to verify key validity and connectivity
    const anthropic = new Anthropic();
    await anthropic.messages.countTokens({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: "health check" }],
    });
    const latencyMs = Date.now() - start;

    if (latencyMs > 5000) {
      return {
        status: "degraded",
        latencyMs,
        message: `Claude API responding but slow (${latencyMs}ms)`,
      };
    }

    return { status: "healthy", latencyMs };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message:
        error instanceof Error ? error.message : "Claude API unreachable",
    };
  }
}
