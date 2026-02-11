import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * Lightweight readiness probe — only checks if the app can serve requests.
 * Used by load balancers and deployment gates.
 * Does NOT check external APIs (Claude) — those are checked by /health.
 */
export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return new NextResponse("OK", { status: 200 });
  } catch {
    return new NextResponse("NOT READY", { status: 503 });
  }
}
