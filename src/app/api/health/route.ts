import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { flashModel } from "@/lib/ai/gemini-client";

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
    ai: HealthCheck;
  };
}

const startTime = Date.now();

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const checks = await Promise.allSettled([checkDatabase(), checkAI()]);

  const [dbCheck, aiCheck] = checks;

  const database =
    dbCheck.status === "fulfilled"
      ? dbCheck.value
      : {
          status: "unhealthy" as const,
          latencyMs: 0,
          message: String(dbCheck.reason),
        };

  const ai =
    aiCheck.status === "fulfilled"
      ? aiCheck.value
      : {
          status: "unhealthy" as const,
          latencyMs: 0,
          message: String(aiCheck.reason),
        };

  const criticalChecks = [database, ai];
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
      ai,
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

async function checkAI(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return {
        status: "unhealthy",
        latencyMs: 0,
        message: "GOOGLE_AI_API_KEY not configured",
      };
    }

    // Minimal call to verify API key validity
    const result = await flashModel.generateContent("Reply with: ok");
    const text = result.response.text();
    const latencyMs = Date.now() - start;

    if (!text) {
      return {
        status: "unhealthy",
        latencyMs,
        message: "Gemini returned empty response",
      };
    }

    if (latencyMs > 5000) {
      return {
        status: "degraded",
        latencyMs,
        message: `Gemini API responding but slow (${latencyMs}ms)`,
      };
    }

    return { status: "healthy", latencyMs };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message:
        error instanceof Error ? error.message : "Gemini API unreachable",
    };
  }
}
