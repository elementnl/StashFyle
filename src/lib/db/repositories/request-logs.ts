import { db } from "../client";
import type { RequestLog, RequestLogInsert } from "../types";

export const requestLogsRepo = {
  async create(log: RequestLogInsert): Promise<RequestLog> {
    const { data, error } = await db
      .from("request_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByUserId(
    userId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{ logs: RequestLog[]; cursor: string | null }> {
    const limit = options?.limit ?? 50;

    let query = db
      .from("request_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (options?.cursor) {
      const decoded = JSON.parse(atob(options.cursor));
      query = query.lt("created_at", decoded.created_at);
    }

    const { data, error } = await query;
    if (error) throw error;

    const logs = data ?? [];
    const hasMore = logs.length > limit;
    const results = hasMore ? logs.slice(0, -1) : logs;

    const nextCursor =
      hasMore && results.length > 0
        ? btoa(JSON.stringify({ created_at: results[results.length - 1].created_at }))
        : null;

    return { logs: results, cursor: nextCursor };
  },

  async findByApiKeyId(
    apiKeyId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{ logs: RequestLog[]; cursor: string | null }> {
    const limit = options?.limit ?? 50;

    let query = db
      .from("request_logs")
      .select("*")
      .eq("api_key_id", apiKeyId)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (options?.cursor) {
      const decoded = JSON.parse(atob(options.cursor));
      query = query.lt("created_at", decoded.created_at);
    }

    const { data, error } = await query;
    if (error) throw error;

    const logs = data ?? [];
    const hasMore = logs.length > limit;
    const results = hasMore ? logs.slice(0, -1) : logs;

    const nextCursor =
      hasMore && results.length > 0
        ? btoa(JSON.stringify({ created_at: results[results.length - 1].created_at }))
        : null;

    return { logs: results, cursor: nextCursor };
  },

  async getStats(
    userId: string,
    since: Date
  ): Promise<{
    totalRequests: number;
    successCount: number;
    errorCount: number;
    avgResponseTime: number;
  }> {
    const { data, error } = await db
      .from("request_logs")
      .select("status_code, response_time_ms")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString());

    if (error) throw error;

    const logs = data ?? [];
    const totalRequests = logs.length;
    const successCount = logs.filter((l) => l.status_code < 400).length;
    const errorCount = logs.filter((l) => l.status_code >= 400).length;
    const avgResponseTime =
      totalRequests > 0
        ? Math.round(logs.reduce((sum, l) => sum + l.response_time_ms, 0) / totalRequests)
        : 0;

    return { totalRequests, successCount, errorCount, avgResponseTime };
  },
};
