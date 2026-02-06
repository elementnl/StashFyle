import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { checkR2Health } from "@/lib/r2/client";

interface HealthCheck {
  status: "ok" | "error";
  latency_ms: number;
  error?: string;
}

interface HealthResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  checks: {
    database: HealthCheck;
    storage: HealthCheck;
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const { error } = await db.from("users").select("id").limit(1);
    if (error) throw error;
    return { status: "ok", latency_ms: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkStorage(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await checkR2Health();
    return { status: "ok", latency_ms: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function determineOverallStatus(checks: HealthResponse["checks"]): HealthResponse["status"] {
  const statuses = Object.values(checks).map((c) => c.status);
  if (statuses.every((s) => s === "ok")) return "ok";
  if (statuses.every((s) => s === "error")) return "error";
  return "degraded";
}

export async function GET(): Promise<NextResponse> {
  const [database, storage] = await Promise.all([
    checkDatabase(),
    checkStorage(),
  ]);

  const checks = { database, storage };
  const status = determineOverallStatus(checks);

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    checks,
  };

  const httpStatus = status === "ok" ? 200 : status === "degraded" ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}
