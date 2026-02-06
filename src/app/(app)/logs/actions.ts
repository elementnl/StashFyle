"use server";

import { requireUser } from "@/lib/auth/supabase";
import { listRequestLogs, getRequestStats } from "@/lib/services/request-logs";
import type { RequestLogResponse } from "@/lib/db/types";

interface LogsResult {
  logs: RequestLogResponse[];
  has_more: boolean;
  cursor: string | null;
}

interface StatsResult {
  total_requests: number;
  success_count: number;
  error_count: number;
  avg_response_time_ms: number;
}

export async function getRequestLogs(cursor?: string): Promise<LogsResult> {
  try {
    const user = await requireUser();
    return await listRequestLogs(user.id, { cursor, limit: 50 });
  } catch {
    return { logs: [], has_more: false, cursor: null };
  }
}

export async function getStats(): Promise<StatsResult> {
  try {
    const user = await requireUser();
    const since = new Date();
    since.setDate(since.getDate() - 7);
    return await getRequestStats(user.id, since);
  } catch {
    return { total_requests: 0, success_count: 0, error_count: 0, avg_response_time_ms: 0 };
  }
}
