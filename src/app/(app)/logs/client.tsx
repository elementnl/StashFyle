"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  FileUp,
  FileDown,
  Trash2,
  Link as LinkIcon,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RequestLogResponse } from "@/lib/db/types";
import { getRequestLogs } from "./actions";

interface StatsData {
  total_requests: number;
  success_count: number;
  error_count: number;
  avg_response_time_ms: number;
}

interface LogsClientProps {
  initialLogs: RequestLogResponse[];
  initialHasMore: boolean;
  initialCursor: string | null;
  stats: StatsData;
}

export function LogsClient({
  initialLogs,
  initialHasMore,
  initialCursor,
  stats,
}: LogsClientProps) {
  const [logs, setLogs] = useState<RequestLogResponse[]>(initialLogs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoadMore() {
    if (!cursor || isLoading) return;
    setIsLoading(true);
    const result = await getRequestLogs(cursor);
    setLogs((prev) => [...prev, ...result.logs]);
    setHasMore(result.has_more);
    setCursor(result.cursor);
    setIsLoading(false);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function getMethodIcon(method: string, endpoint: string) {
    if (endpoint.includes("/upload") || method === "POST") {
      if (endpoint.includes("signed-url")) {
        return <LinkIcon className="h-3.5 w-3.5" />;
      }
      return <ArrowUpRight className="h-3.5 w-3.5" />;
    }
    if (method === "DELETE") {
      return <Trash2 className="h-3.5 w-3.5" />;
    }
    return <ArrowDownRight className="h-3.5 w-3.5" />;
  }

  function getMethodColor(method: string) {
    switch (method) {
      case "GET":
        return "bg-blue-500/10 text-blue-600";
      case "POST":
        return "bg-green-500/10 text-green-600";
      case "DELETE":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  }

  function getStatusColor(statusCode: number) {
    if (statusCode < 300) return "text-green-600";
    if (statusCode < 400) return "text-yellow-600";
    return "text-red-600";
  }

  function formatEndpoint(endpoint: string): string {
    return endpoint
      .replace("/api/v1/", "")
      .replace(":id", "*");
  }

  const isEmpty = logs.length === 0;
  const successRate =
    stats.total_requests > 0
      ? Math.round((stats.success_count / stats.total_requests) * 100)
      : 0;

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Request Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          API requests and usage
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<Activity className="h-4 w-4" />}
          label="Total Requests"
          value={stats.total_requests.toLocaleString()}
          sublabel="Last 7 days"
        />
        <StatsCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Success Rate"
          value={`${successRate}%`}
          sublabel={`${stats.success_count} successful`}
        />
        <StatsCard
          icon={<XCircle className="h-4 w-4" />}
          label="Errors"
          value={stats.error_count.toLocaleString()}
          sublabel="Last 7 days"
          isError={stats.error_count > 0}
        />
        <StatsCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg Response"
          value={`${stats.avg_response_time_ms}ms`}
          sublabel="Response time"
        />
      </div>

      {/* Logs Table */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 py-16 bg-primary/5">
          <div className="rounded-full bg-primary/10 p-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No requests yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            API requests will appear here once you start using your keys
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                    When
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${getMethodColor(log.method)}`}>
                          {getMethodIcon(log.method, log.endpoint)}
                        </div>
                        <span className="text-sm font-medium text-foreground font-mono">
                          {formatEndpoint(log.endpoint)}
                        </span>
                        {log.error_code && (
                          <span className="text-xs text-red-500 font-mono">
                            {log.error_code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMethodColor(
                          log.method
                        )}`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${getStatusColor(
                          log.status_code
                        )}`}
                      >
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {log.response_time_ms}ms
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {log.file_size_bytes
                        ? formatBytes(log.file_size_bytes)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-primary border-primary/30 hover:bg-primary/5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function StatsCard({
  icon,
  label,
  value,
  sublabel,
  isError = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  isError?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-4 bg-card">
      <div className="flex items-center gap-2">
        <div
          className={`p-1.5 rounded ${
            isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-semibold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
