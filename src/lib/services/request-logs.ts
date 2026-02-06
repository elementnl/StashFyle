import { requestLogsRepo } from "../db/repositories/request-logs";
import type { ApiKey, RequestLogResponse } from "../db/types";

interface LogParams {
  apiKey: ApiKey;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
  fileSize?: number;
  errorCode?: string;
  ipAddress?: string;
}

export function logRequest(params: LogParams): void {
  const {
    apiKey,
    method,
    endpoint,
    statusCode,
    responseTimeMs,
    fileSize,
    errorCode,
    ipAddress,
  } = params;

  requestLogsRepo
    .create({
      user_id: apiKey.user_id,
      api_key_id: apiKey.id,
      method,
      endpoint,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      file_size_bytes: fileSize ?? null,
      error_code: errorCode ?? null,
      ip_address: ipAddress ?? null,
    })
    .catch(() => {
      // Fire and forget - don't block requests
    });
}

function toResponse(log: {
  id: string;
  method: string;
  endpoint: string;
  status_code: number;
  response_time_ms: number;
  file_size_bytes: number | null;
  error_code: string | null;
  created_at: string;
}): RequestLogResponse {
  return {
    id: log.id,
    method: log.method,
    endpoint: log.endpoint,
    status_code: log.status_code,
    response_time_ms: log.response_time_ms,
    file_size_bytes: log.file_size_bytes,
    error_code: log.error_code,
    created_at: log.created_at,
  };
}

export async function listRequestLogs(
  userId: string,
  options?: { limit?: number; cursor?: string }
): Promise<{ logs: RequestLogResponse[]; has_more: boolean; cursor: string | null }> {
  const result = await requestLogsRepo.findByUserId(userId, options);

  return {
    logs: result.logs.map(toResponse),
    has_more: result.cursor !== null,
    cursor: result.cursor,
  };
}

export async function getRequestStats(
  userId: string,
  since: Date
): Promise<{
  total_requests: number;
  success_count: number;
  error_count: number;
  avg_response_time_ms: number;
}> {
  const stats = await requestLogsRepo.getStats(userId, since);

  return {
    total_requests: stats.totalRequests,
    success_count: stats.successCount,
    error_count: stats.errorCount,
    avg_response_time_ms: stats.avgResponseTime,
  };
}
